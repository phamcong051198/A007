import { is } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain } from 'electron'
import {
  Account,
  BetListResult,
  ContraList,
  PerMatchDetail,
  Platform,
  Setting,
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
  PlatformType,
  SettingPerMatchLimitType,
  SettingType,
  SportsBookType
} from '@shared/common/types'
import { GetAccount1Account2 } from '@/browserWindows/service/getAccount1Account2'
import { GetListAccountPair } from '@/browserWindows/service/getListAccountPair'
import { getSuggestedClient } from '@/browserWindows/service/getSuggestedClient'
import { handleAddControls } from '@/browserWindows/service/handleAddControls'
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

export async function createMainWindow() {
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

  ipcMain.on('LoginAll_Platform', async (_, platform) => {
    await handleLoginAll_Platform(mainWindow, activeSportsBook, platform)
  })

  ipcMain.on('LogoutAll_Platform', (_, platform) => {
    handleLogoutAll_Platform(mainWindow, activeSportsBook, platform)
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
