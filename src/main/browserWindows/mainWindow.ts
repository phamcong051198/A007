import { is } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain } from 'electron'
import {
  Account,
  AccountSwitch,
  AllowLeague,
  BetListResult,
  BlockLeague,
  clearTable,
  ContraList,
  LoginSchedulerSetting,
  NameLeague,
  PerMatchDetail,
  Platform,
  Setting,
  SettingLeagueFilter,
  SettingPerMatchLimit,
  SettingTableView,
  SportsBook,
  SuccessList,
  WaitingList
} from '@db/model'
import { join } from 'path'
import { handleAddAccountPlatForm } from '@/browserWindows/service/handleAddAccountPlatForm'
import { handleDeleteAccount } from '@/browserWindows/service/handleDeleteAccount'
import { handleDeletePlatForm } from '@/browserWindows/service/handleDeletePlatForm'
import { handleGetDataSportsBook } from '@/browserWindows/service/handleGetDataSportsBook'
import {
  handleLoginAccount,
  handleLogoutAccount
} from '@/browserWindows/service/handleLoginLogoutAccount'
import {
  NameLeagueType,
  PlatformType,
  SettingPerMatchLimitType,
  SettingType,
  SportsBookType
} from '@shared/common/types'
import { GetAccount1Account2 } from '@/browserWindows/service/getAccount1Account2'
import { GetListAccountPair } from '@/browserWindows/service/getListAccountPair'
import { getSuggestedClient } from '@/browserWindows/service/getSuggestedClient'
import { handleAddControls } from '@/browserWindows/service/handleAddControls'
import { handleDelayLogin } from '@/browserWindows/service/handleDelayLogin'
import { handleDelayLoginAll } from '@/browserWindows/service/handleDelayLoginAll'
import { handleListReportFile } from '@/browserWindows/service/handleListReportFile'
import { handleLoginAll } from '@/browserWindows/service/handleLoginAll'
import { handleLoginAll_Platform } from '@/browserWindows/service/handleLoginAll_Platform'
import { handleLogoutAll } from '@/browserWindows/service/handleLogoutAll'
import { handleLogoutAll_Platform } from '@/browserWindows/service/handleLogoutAll_Platform'
import {
  SaveAccountCombination,
  SaveAccountCombinationByArray
} from '@/browserWindows/service/saveAccountCombination'
import { updateDataAccount } from '@/browserWindows/service/updateDataAccount'
import { updateDataListAccount } from '@/browserWindows/service/updateDataListAccount'
import { systemLogToFile } from '@/worker/lib/systemLogToFile'
import {
  BetListDBType,
  SettingTableViewType,
  WaitingSuccessContraDBType
} from '@shared/common/types'
import { DEFAULT_SPORTS_BOOK_CONFIG, DEFAULT_TEAM_NAME_LIMIT } from '@shared/main/constants'
import { DataBetSettingPayload, SchedulerType } from '@shared/main/types'
import { handleSwitchListAccount } from './service/handleSwitchAccount'
import { handleUpdateDataListAccountSwitch } from './service/handleUpdateDataListAccountSwitch'
import { initSocket } from './service/socket'

export async function createMainWindow(account: { username: string }) {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 177,
    minHeight: 100,
    show: false,
    autoHideMenuBar: true,
    center: true,
    frame: false,
    titleBarOverlay: false,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    trafficLightPosition: { x: 15, y: 10 },
    icon: 'build/icon.png',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL('http://localhost:5173/#/main')
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'main' })
  }

  mainWindow.webContents.once('did-finish-load', async () => {
    mainWindow.show()
    if (!is.dev) {
      await systemLogToFile(`[Main] SetupAutoCheckUpdate has been activated`, 'Program')
    }
  })

  ipcMain.on('window-control', (event, action: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    switch (action) {
      case 'minimize':
        win.minimize()
        break
      case 'maximize':
        win.isMaximized() ? win.unmaximize() : win.maximize()
        break
      case 'close':
        win.close()
        break
    }
  })

  //************************************** Popup Account *********************************************** */

  let activeSportsBook: string = 'sports-book1'

  ipcMain.on('SetActiveSportsbookTab', (_, activeId) => {
    activeSportsBook = activeId
  })
  //************************************** SettingWindow *********************************************** */

  ipcMain.handle('GetDataSetting', () => {
    return Setting.findAll()
  })

  let intervalId: NodeJS.Timeout | null = null

  ipcMain.on('SaveSettingWindow', (_, data: SettingType) => {
    const settings = Setting.findAll() as SettingType[]
    Setting.update({ id: settings[0].id }, { ...data })
    Account.updateMany({ checkBoxRefresh: 1 }, { typeCrawl: data.gameType })

    const scheduler = {
      schedulerRunning: data.schedulerRunning,
      schedulerInputRunning: data.schedulerInputRunning,
      schedulerToday: data.schedulerToday,
      schedulerInputToday: data.schedulerInputToday,
      schedulerEarly: data.schedulerEarly,
      schedulerInputEarly: data.schedulerInputEarly
    }

    function scheduleLogger(scheduler: SchedulerType) {
      const now = new Date()
      const currentTime = now.getHours() * 100 + now.getMinutes()

      const parseTimeRanges = (
        timeRanges: string
      ): { start: number; end: number; isCrossDay: boolean }[] => {
        if (!timeRanges) return []
        return timeRanges
          .split(',')
          .map((range) => {
            const [start, end] = range.split('-').map(Number)
            if (isNaN(start) || isNaN(end)) return null
            const isCrossDay = end < start
            return { start, end, isCrossDay }
          })
          .filter((x): x is { start: number; end: number; isCrossDay: boolean } => x !== null)
      }

      const isTimeInRanges = (
        current: number,
        ranges: { start: number; end: number; isCrossDay: boolean }[]
      ) => {
        return ranges.some(({ start, end, isCrossDay }) => {
          if (isCrossDay) {
            return current >= start || current <= end
          } else {
            return current >= start && current <= end
          }
        })
      }

      const allSchedulersOff =
        scheduler.schedulerEarly === 0 &&
        scheduler.schedulerToday === 0 &&
        scheduler.schedulerRunning === 0

      if (allSchedulersOff) {
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
          console.log('Scheduler stopped: All schedulers are 0')
        }
        return
      }

      const earlyRanges =
        scheduler.schedulerEarly === 1 && scheduler.schedulerInputEarly
          ? parseTimeRanges(scheduler.schedulerInputEarly)
          : []
      const todayRanges =
        scheduler.schedulerToday === 1 && scheduler.schedulerInputToday
          ? parseTimeRanges(scheduler.schedulerInputToday)
          : []
      const runningRanges =
        scheduler.schedulerRunning === 1 && scheduler.schedulerInputRunning
          ? parseTimeRanges(scheduler.schedulerInputRunning)
          : []

      const activeSchedulers = [
        { enabled: scheduler.schedulerEarly, input: scheduler.schedulerInputEarly },
        { enabled: scheduler.schedulerToday, input: scheduler.schedulerInputToday },
        { enabled: scheduler.schedulerRunning, input: scheduler.schedulerInputRunning }
      ].filter((s) => s.enabled === 1)

      if (activeSchedulers.length > 0 && activeSchedulers.every((s) => !s.input)) {
        Setting.update({ id: settings[0].id }, { gameType: 'None' })
        console.log('Length==0 = > None')
        return
      }

      if (earlyRanges.length > 0 && isTimeInRanges(currentTime, earlyRanges)) {
        Account.updateTypeCrawlForRefresh('Early')
        Setting.update({ id: settings[0].id }, { ...data, gameType: 'Early' })
        console.log('Early')
      } else if (todayRanges.length > 0 && isTimeInRanges(currentTime, todayRanges)) {
        Account.updateTypeCrawlForRefresh('Today')
        Setting.update({ id: settings[0].id }, { ...data, gameType: 'Today' })

        console.log('Today')
      } else if (runningRanges.length > 0 && isTimeInRanges(currentTime, runningRanges)) {
        Account.updateTypeCrawlForRefresh('Running')
        Setting.update({ id: settings[0].id }, { ...data, gameType: 'Running' })

        console.log('Running')
      } else {
        Account.updateTypeCrawlForRefresh('None')
        Setting.update({ id: settings[0].id }, { ...data, gameType: 'None' })

        console.log('None')
      }
    }

    function startScheduler(scheduler: SchedulerType) {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
        console.log('Previous scheduler stopped')
      }

      if (
        scheduler.schedulerEarly === 0 &&
        scheduler.schedulerToday === 0 &&
        scheduler.schedulerRunning === 0
      ) {
        console.log('Scheduler not started: All schedulers are 0')
        return
      } else {
        scheduleLogger(scheduler)

        if (!intervalId) {
          intervalId = setInterval(() => {
            scheduleLogger(scheduler)
          }, 40000)
        }
      }
    }

    startScheduler(scheduler)
  })

  //******************************************************************************************************* */

  //************************************** BetSettingWindow *********************************************** */

  ipcMain.handle('GetRangePlatform', () => {
    const sportBooks = SportsBook.findAll() as SportsBookType[]
    const rangePlatforms = sportBooks.map(({ id, platform, valueRange }) => ({
      id,
      platform,
      valueRange
    }))

    const setting = Setting.findAll()[0] as SettingType

    const otherSetting = {
      id: setting.id,
      isOther: setting.isOther,
      isBetUnderSelected: setting.isBetUnderSelected,
      isBetOverSelected: setting.isBetOverSelected,
      isBetPutSelected: setting.isBetPutSelected,
      isBetEatSelected: setting.isBetEatSelected
    }

    return {
      rangePlatforms,
      otherSetting
    }
  })

  ipcMain.on('DataBetSetting', (_event, payload: DataBetSettingPayload) => {
    const { rangePlatforms, otherSetting } = payload

    for (const { id, valueRange } of rangePlatforms) {
      SportsBook.update({ id }, { valueRange })
    }
    Setting.update(
      { id: otherSetting.id },
      {
        isOther: otherSetting.isOther,
        isBetUnderSelected: otherSetting.isBetUnderSelected,
        isBetOverSelected: otherSetting.isBetOverSelected,
        isBetPutSelected: otherSetting.isBetPutSelected,
        isBetEatSelected: otherSetting.isBetEatSelected
      }
    )
  })

  //******************************************************************************************************* */

  //************************************** ProxyServerSettingGeneral *********************************************** */

  ipcMain.on('UpdateDataProxyServerSettingsGeneral', (_, data) => {
    const settings = Setting.findAll() as SettingType[]
    if (!settings.length) return

    Setting.update(
      { id: settings[0].id },
      {
        ipAddress: data.ipAddress,
        port: data.port || '0',
        username: data.username,
        password: data.password
      }
    )
  })

  //***************************************************************************************************** */

  //************************************** ListPlatformBookWindow *********************************************** */

  ipcMain.handle('GetListPlatform', () => {
    return Platform.findAll()
  })

  ipcMain.handle('AddPlatForm', (_, platform: PlatformType) => {
    const isPlatform = SportsBook.findOne({ platform: platform.name }) as SportsBookType
    if (isPlatform) {
      return 1
    }

    SettingPerMatchLimit.create({
      namePlatform: platform.name,
      ...DEFAULT_TEAM_NAME_LIMIT
    })

    SportsBook.create({
      name: activeSportsBook,
      platform: platform.name,
      url: platform.url,
      suggestedClient: String(getSuggestedClient()),
      ...DEFAULT_SPORTS_BOOK_CONFIG
    })

    const dataSportsBook = handleGetDataSportsBook(activeSportsBook)
    mainWindow.webContents.send('DataSportsBook', dataSportsBook)

    return 0
  })

  //************************************************************************************* */
  //************************************** ScheduledLoginLogoutSettingWindow *********************************************** */

  ipcMain.handle('GetDataLoginSchedulerSetting', () => {
    return LoginSchedulerSetting.findAll()
  })

  ipcMain.on('DataSaveLoginSchedulerSetting', (_, data) => {
    clearTable('LoginSchedulerSetting')
    LoginSchedulerSetting.insertMany(data)
  })

  //************************************************************************************* */
  //************************************** AccountListWindow *********************************************** */

  ipcMain.handle('GetListAccountByPlatform', (_, platform) => {
    return Account.findAll({ platformName: platform, statusDelete: 0 }).sort((a, b) => {
      const aOrder = Number(a.orderNumber ?? 0)
      const bOrder = Number(b.orderNumber ?? 0)
      return aOrder - bOrder
    })
  })

  ipcMain.on('SaveAccountListWindow', (_, data) => {
    const { sportsBookId, dataAccountNew } = data
    if (!dataAccountNew || !dataAccountNew.length) return

    updateDataListAccount(dataAccountNew, mainWindow, sportsBookId)
  })

  //************************************************************************************* */

  //************************************** AccountPairWindow *********************************************** */

  ipcMain.on('AccountPairWindow', async (_, { isClearInvalidAccount, dataAccountPair }) => {
    await SaveAccountCombination(
      isClearInvalidAccount,
      dataAccountPair,
      activeSportsBook,
      mainWindow
    )
  })

  ipcMain.handle('GetAccount1Account2', () => {
    return GetAccount1Account2()
  })

  ipcMain.handle('GetListAccountPair', () => {
    return GetListAccountPair()
  })

  ipcMain.on('ListAccountPairAddSelected', async (_, data) => {
    await SaveAccountCombinationByArray(data, activeSportsBook, mainWindow)
  })

  //************************************************************************************* */

  //************************************** mainWindow *********************************************** */

  ipcMain.handle('GetListSportBook', () => {
    return SportsBook.findAll()
  })

  ipcMain.on('SelectSportsBook', (_, sportsBook) => {
    activeSportsBook = sportsBook
  })

  ipcMain.handle('GetDataSportsBook', () => {
    return handleGetDataSportsBook(activeSportsBook)
  })

  ipcMain.on('DeleteAccount', (_, account) => {
    handleDeleteAccount(mainWindow, account, activeSportsBook)
  })

  ipcMain.on('UpdateDelaySec_Platform', (_, data: { platform: string; dataUpdate: object }) => {
    const dataUpdate = data.dataUpdate
    SportsBook.update({ name: activeSportsBook, platform: data.platform }, { ...dataUpdate })
  })

  ipcMain.on('DeletePlatform', (_, namePlatform) => {
    handleDeletePlatForm(mainWindow, namePlatform, activeSportsBook)
  })

  ipcMain.handle('DataAccount', (_, id) => {
    return Account.findById(id)
  })

  ipcMain.handle('CheckUserNameAccount', (_, data) => {
    const { username, platform } = data
    const checkAccount = Account.findOne({ loginID: username, platformName: platform })
    return !!checkAccount
  })

  ipcMain.on('Data_AccountLoginForm', (_, data) => {
    const { activeId, account } = data
    updateDataAccount(activeId, account, mainWindow)
  })

  ipcMain.on('AddAccountPlatForm', (_, data) => {
    handleAddAccountPlatForm(mainWindow, data, activeSportsBook)
  })

  ipcMain.on('UpdateAccount', (_, data) => {
    const validFields = ['checkBoxBet', 'checkBoxRefresh', 'checkBoxAutoLogin', 'checkBoxLockURL']
    if (!validFields.includes(data.field)) return

    if (data.field === 'checkBoxRefresh') {
      if (data.value === 1) {
        const setting = Setting.findAll() as SettingType[]
        Account.update(
          { id: data.accountId },
          { typeCrawl: setting[0].gameType, [data.field]: data.value }
        )
      } else {
        Account.update({ id: data.accountId }, { [data.field]: data.value })
      }
    } else {
      Account.update({ id: data.accountId }, { [data.field]: data.value })
    }
  })

  ipcMain.on('LoginAccount', (_, account) => {
    handleLoginAccount(account, mainWindow)
  })

  ipcMain.on('LogoutAccount', (_, account) => {
    handleLogoutAccount(account, mainWindow)
  })

  ipcMain.on('CloseSportsBookPerMatchLimitSetting', (_, { enable, listPlatform }) => {
    if (!listPlatform.length) return

    Setting.update({}, { enablePerMatchLimitSetting: enable })
    for (const platform of listPlatform) {
      SettingPerMatchLimit.update(
        { id: platform.id },
        {
          limitMethod: platform.limitMethod,
          limitType: platform.limitType,
          totalAmount: platform.totalAmount,
          totalCount: platform.totalCount
        }
      )
    }
  })

  ipcMain.on('AddControls', (_, data) => {
    const { activeId: activeSportsBook, platformName, platformURL, numberAccount } = data
    handleAddControls(mainWindow, activeSportsBook, platformName, platformURL, numberAccount)
  })

  ipcMain.handle('PerMatchLimitSetting', () => {
    const settings = Setting.findAll() as SettingType[]
    const perMatchLimitSetting = SettingPerMatchLimit.findAll() as SettingPerMatchLimitType[]
    return {
      enable: settings[0].enablePerMatchLimitSetting,
      data: perMatchLimitSetting
    }
  })

  ipcMain.handle('PerMatchLimitDetailPlatform', (_, platform) => {
    return PerMatchDetail.findAll({ platform })
  })

  ipcMain.handle('SettingViewTable', (_, { tab }) => {
    return SettingTableView.findOne({ tab }) as SettingTableViewType
  })

  ipcMain.on(
    'UpdateSettingViewTable',
    (
      _,
      {
        tab,
        data
      }: { tab: string; data: { contraStrategy: string; clear: number; scroll: number } }
    ) => {
      SettingTableView.update({ tab }, data)
      const otherTab = tab === 'BetList' ? 'ContraList' : tab === 'ContraList' ? 'BetList' : null
      if (otherTab)
        SettingTableView.update({ tab: otherTab }, { contraStrategy: data.contraStrategy })
    }
  )

  ipcMain.handle('GetBetListResult', () => {
    const data = BetListResult.findAll() as BetListDBType[]
    return data.flatMap((item: BetListDBType) => JSON.parse(item.dataPair))
  })

  ipcMain.handle('GetWaitingList', () => {
    const data = WaitingList.findAll() as WaitingSuccessContraDBType[]
    return data.flatMap((item: WaitingSuccessContraDBType) => JSON.parse(item.dataPair))
  })

  ipcMain.handle('GetContraList', () => {
    const data = ContraList.findAll() as WaitingSuccessContraDBType[]
    return data.flatMap((item: WaitingSuccessContraDBType) => JSON.parse(item.dataPair))
  })

  ipcMain.handle('GetSuccessList', () => {
    const data = SuccessList.findAll() as WaitingSuccessContraDBType[]
    return data.flatMap((item: WaitingSuccessContraDBType) => JSON.parse(item.dataPair))
  })

  ipcMain.on('LoginAll', async () => {
    await handleLoginAll(mainWindow, activeSportsBook)
  })

  ipcMain.on('LogoutAll', () => {
    handleLogoutAll(mainWindow, activeSportsBook)
  })

  ipcMain.on('DelayLoginAll', () => {
    handleDelayLoginAll(mainWindow, activeSportsBook)
  })

  ipcMain.on('LoginAll_Platform', async (_, platform) => {
    await handleLoginAll_Platform(mainWindow, activeSportsBook, platform)
  })

  ipcMain.on('LogoutAll_Platform', (_, platform) => {
    handleLogoutAll_Platform(mainWindow, activeSportsBook, platform)
  })

  ipcMain.on('DelayLoginAll_Platform', (_, platform) => {
    handleDelayLogin(mainWindow, platform)
  })

  ipcMain.on('DataUpdateDelayedLoginSetting', (_, data) => {
    const { sportsBookId, platform, delayLoginSec_from, delayLoginSec_to } = data
    SportsBook.update({ name: sportsBookId, platform }, { delayLoginSec_from, delayLoginSec_to })
  })

  ipcMain.handle('DataDelayedLoginSetting', (_, data) => {
    return SportsBook.findOne({ platform: data })
  })

  ipcMain.on('Data_ProxyServerSetting_Platform', (_, data) => {
    const { platformName, formData } = data

    const cleanPort = formData.port ? formData.port.replace(/^0+/, '') || '0' : null
    Account.update(
      { platformName },
      {
        proxyIP: formData.ipAddress || null,
        proxyPort: cleanPort,
        proxyUsername: formData.username || null,
        proxyPassword: formData.password || null
      }
    )
  })

  ipcMain.handle('VIPAccountCheckerSetting', (_, data) => {
    const sportsBookByPlatform = SportsBook.findOne({ platform: data }) as SportsBookType
    return sportsBookByPlatform.VIPAccountLogout
  })

  ipcMain.on('updateVIPAccountCheckerSetting', (_, data) => {
    const { platform, VIPAccountLogout } = data
    SportsBook.update({ platform }, { VIPAccountLogout })
  })

  //************************************************************************************* */

  //************************************** accountSwitchList *********************************************** */

  ipcMain.handle('GetListAccountSwitchByPlatform', (_, platformName) => {
    return AccountSwitch.findAll({ platformName })
  })

  ipcMain.on('SaveAccountListSwitchWindow', (_, data) => {
    const { sportsBookId, platformName, dataAccountNew } = data

    const dataSportsBook = handleGetDataSportsBook(sportsBookId)
    mainWindow.webContents.send('DataSportsBook', dataSportsBook)
    handleUpdateDataListAccountSwitch(dataAccountNew, platformName)
  })

  ipcMain.on('SaveAccountListSwitchWindowAuto', (_, data, platformName) => {
    if (!data || !data.length) {
      return
    }
    handleUpdateDataListAccountSwitch(data, platformName)
  })

  ipcMain.handle('getPlatform', (_, platformName) => {
    const data = Platform.findOne({ name: platformName }) as PlatformType
    return data.url
  })

  //************************************************************************************* */

  //************************************** accountSwitchInterval *********************************************** */

  ipcMain.handle('DataSwitchIntervalSetting', (_, platformName) => {
    return SportsBook.findOne({ platform: platformName })
  })

  ipcMain.on('DataUpdateSwitchIntervalSetting', (_, data) => {
    const {
      sportsBookId,
      platform,
      switchIntervalSetting_from,
      switchIntervalSetting_to,
      switchIntervalSettingMinutes
    } = data

    const dataSportsBook = handleGetDataSportsBook(sportsBookId)
    mainWindow.webContents.send('DataSportsBook', dataSportsBook)
    SportsBook.update(
      { name: sportsBookId, platform: platform },
      { switchIntervalSetting_from, switchIntervalSetting_to, switchIntervalSettingMinutes }
    )
  })

  //************************************************************************************* */

  //************************************** accountSwitchTypeSetting *********************************************** */

  ipcMain.on('DataUpdateSwitchTypeSetting', (_, data) => {
    const { sportsBookId, platform, accountType } = data

    const dataSportsBook = handleGetDataSportsBook(sportsBookId)
    mainWindow.webContents.send('DataSportsBook', dataSportsBook)
    SportsBook.update({ name: sportsBookId, platform }, { accountType })
  })

  //************************************************************************************* */

  //************************************** accountSwitchSettingOff *********************************************** */

  ipcMain.on('DataUpdateSwitchSettingOFF', (_, data) => {
    const { sportsBookId, platform, switchAccountSetting } = data

    const dataSportsBook = handleGetDataSportsBook(sportsBookId)
    mainWindow.webContents.send('DataSportsBook', dataSportsBook)
    SportsBook.update(
      { name: sportsBookId, platform },
      { switchAccountSetting: switchAccountSetting }
    )
  })

  //************************************************************************************* */

  //************************************** DataUpdateSwitchHighLight *********************************************** */

  ipcMain.on('DataUpdateSwitchHighLight', (_, data) => {
    const { sportsBookId, platformName, formData } = data
    SportsBook.update({ name: sportsBookId, platform: platformName }, { ...formData })

    const dataSportsBook = handleGetDataSportsBook(activeSportsBook)
    mainWindow.webContents.send('DataSportsBook', dataSportsBook)
  })

  ipcMain.handle('GetDataSettingLeagueFilter', () => {
    return SettingLeagueFilter.findAll()[0]
  })

  ipcMain.handle('GetDataBlockLeague', () => {
    return BlockLeague.findAll()
  })

  ipcMain.handle('GetDataAllowLeague', () => {
    return AllowLeague.findAll()
  })

  ipcMain.handle('GetDataLeague', () => {
    const data = NameLeague.findAll() as NameLeagueType[]
    const result: { id: number; league: string }[] = Object.values(
      data
        .filter(
          (item) =>
            item.league &&
            item.league.trim() !== '' &&
            item.league !== null &&
            !item.league.includes('Corners')
        )
        .reduce<Record<string, { id: number; league: string }>>((acc, item) => {
          acc[item.league] = { id: item.id, league: item.league.trim() }
          return acc
        }, {})
    ).sort((a, b) => a.league.localeCompare(b.league))

    return result
  })

  let filterTypeRoot = SettingLeagueFilter.findAll()[0].filterType as string
  ipcMain.on(
    'DataLeagueFilter',
    async (
      _,
      {
        filterType,
        blockMajorLeague,
        allowMajorLeague,
        listAllowLeagueTable,
        listBlockLeagueTable
      }: {
        filterType: string
        blockMajorLeague: number
        allowMajorLeague: number
        listAllowLeagueTable: { id: number | string; league: string }[]
        listBlockLeagueTable: { id: number | string; league: string }[]
      }
    ) => {
      SettingLeagueFilter.update({}, { filterType, blockMajorLeague, allowMajorLeague })
      const newBlockLeagues = listBlockLeagueTable.map(({ league }) => ({ league }))
      const newAllowLeagues = listAllowLeagueTable.map(({ league }) => ({ league }))

      await Promise.all([clearTable('BlockLeague'), clearTable('AllowLeague')])
      await Promise.all([
        BlockLeague.insertMany(newBlockLeagues),
        AllowLeague.insertMany(newAllowLeagues)
      ])
      if (filterTypeRoot !== filterType) {
        filterTypeRoot = filterType
        clearTable('DataBet')
      }
    }
  )

  ipcMain.on('switchIntervalSetting', (_, platform, data, isOn) => {
    handleSwitchListAccount(platform, mainWindow, data, isOn)
  })

  //************************************************************************************* */

  //************************************** ConfirmLogoutWindow *********************************************** */

  ipcMain.on('CloseAppByToken', async () => {
    mainWindow.hide()
    const date = new Date()
      .toISOString()
      .replace(/[-T:Z]/g, '')
      .slice(0, 14)

    const betList = BetListResult.findAll() as BetListDBType[]
    if (betList.length > 0) {
      const flattenedDataBetList = betList.flatMap((item) => JSON.parse(item.dataPair))
      handleListReportFile(flattenedDataBetList, 'BetListReport', date)
    }

    const successList = SuccessList.findAll() as WaitingSuccessContraDBType[]
    if (successList.length > 0) {
      const flattenedDataSuccessList = successList.flatMap((item) => JSON.parse(item.dataPair))
      handleListReportFile(flattenedDataSuccessList, 'SuccessListReport', date)
    }

    app.quit()
  })

  ipcMain.on('reconnectionToken', async (_event, token) => {
    initSocket(token, 'en', mainWindow)
  })

  ipcMain.on('refreshTokenOnServer', async (event, token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/user/auth/refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token })
      })
      if (!response.ok) {
        return event.reply('LoginResult', { success: false, message: 'Invalid credentials.' })
      }

      const responseData = (await response.json()) as {
        data: { accessToken: string; refreshToken: string }
      }

      const { accessToken, refreshToken } = responseData.data
      event.reply('setToken', { success: true, accessToken, refreshToken })
    } catch (error) {
      if (error instanceof Error) {
        console.error('Login error:', error)
        event.reply('LoginResult', {
          success: false,
          message: `Login Fail: ${error.message}`
        })
      } else {
        console.error('Login error:', error)
        event.reply('LoginResult', {
          success: false,
          message: 'An error occurred during login. Please try again.'
        })
      }
    }
  })

  ipcMain.on('setExpiredDate', async (_event, expiredDate) => {
    mainWindow.setTitle(
      `B-Soft Vietnam ${app.getVersion()}         User: ${account.username}/ Expiry Date: ${expiredDate}`
    )
  })

  ipcMain.on('QuitApp', async () => {
    const date = new Date()
      .toISOString()
      .replace(/[-T:Z]/g, '')
      .slice(0, 14)

    const betList = BetListResult.findAll() as BetListDBType[]
    if (betList.length > 0) {
      const flattenedDataBetList = betList.flatMap((item) => JSON.parse(item.dataPair))
      handleListReportFile(flattenedDataBetList, 'BetListReport', date)
    }

    const successList = SuccessList.findAll() as WaitingSuccessContraDBType[]
    if (successList.length > 0) {
      const flattenedDataSuccessList = successList.flatMap((item) => JSON.parse(item.dataPair))
      handleListReportFile(flattenedDataSuccessList, 'SuccessListReport', date)
    }
    app.quit()
  })

  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  return mainWindow
}
