/* eslint-disable @typescript-eslint/no-explicit-any */
import { setTimeout as delay } from 'timers/promises'
import { createInitAppWindow } from '@/browserWindows/initAppWindow'
import { createMainWindow } from '@/browserWindows/mainWindow'
import { fetchDataSystem } from '@/browserWindows/service/fetchDataSystem'
import { createWorkerScheduledLoginSetting, createWorkerScheduledLogoutSetting } from '@/worker'
import { systemLogToFile } from '@/worker/lib/systemLogToFile'
import {
  Account,
  clearTable,
  LoginSchedulerSetting,
  NameLeague,
  NameTeam,
  Platform,
  Setting,
  SettingLeagueFilter,
  SettingTableView
} from '@db/model'
import { is, optimizer } from '@electron-toolkit/utils'
import { SettingTableViewType } from '@shared/common/types'
import {
  DEFAULT_ACCOUNT_STATUS,
  DEFAULT_SETTING,
  LOGIN_SCHEDULER_SETTING
} from '@shared/main/constants'
import {
  Announcement,
  LoginSchedulerSettingType,
  PlatformType,
  SettingLeagueFilterType,
  SettingType
} from '@shared/common/types'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import { createPopupImage } from './browserWindows/popupImage'
import { initSocket } from './browserWindows/service/socket'

type ResponseData<T> = {
  message: string
  data: T
}

let loginWindow: BrowserWindow | null = null
let mainWindow: BrowserWindow | null = null

const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'
app.setAppUserModelId(isBSoft ? 'BSoft-SpeedWin-appId' : 'BSoft-CornerPro-appId')

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
}

function createWindow() {
  const loginWindow = new BrowserWindow({
    width: 456,
    height: 638,
    show: false,
    autoHideMenuBar: true,
    center: true,
    frame: false,
    titleBarOverlay: false,
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    trafficLightPosition: { x: 15, y: 10 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  ipcMain.on('CloseLoginWindow', () => {
    loginWindow.close()
    app.quit()
  })

  let isLoggingIn = false
  ipcMain.on('AttemptLogin', async (event, { username, password }) => {
    if (isLoggingIn) return

    isLoggingIn = true
    try {
      const payload = isBSoft ? { username, password } : { username, password, appType: 'CORNER' }

      const response = await fetch(`${import.meta.env.VITE_URL}/user/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        await systemLogToFile('Login: Invalid credentials.', 'Error')
        return event.reply('LoginResult', { success: false, message: 'Invalid credentials.' })
      }

      const responseData = (await response.json()) as {
        data: { accessToken: string; account: any; refreshToken: string; versionLatest: string }
      }

      try {
        await systemLogToFile(`[Login] SetupCheckUpdate has been activated`, 'Program')
        await setupCheckUpdate(event, loginWindow, responseData)
      } catch (error) {
        console.log('[Login] Error in setupCheckUpdate', error)
        await systemLogToFile(`[Login] CheckUpdateVersion: ${JSON.stringify(error)}`, 'Error')
      }
    } catch (error) {
      if (error instanceof Error) {
        await systemLogToFile(`Login: ${JSON.stringify(error.message)}`, 'Error')
        console.error('Login error:', error)
        event.reply('LoginResult', {
          success: false,
          message: `Login Fail: ${error.message}`
        })
      } else {
        await systemLogToFile('Login: An error occurred during login. Please try again.', 'Error')

        console.error('Login error:', error)
        event.reply('LoginResult', {
          success: false,
          message: 'An error occurred during login. Please try again.'
        })
      }
    } finally {
      isLoggingIn = false
    }
  })

  loginWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    loginWindow.loadURL('http://localhost:5173/#/login')
  } else {
    loginWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'login' })
  }

  loginWindow.webContents.once('did-finish-load', () => {
    loginWindow.show()
  })

  return loginWindow
}

async function setupCheckUpdate(
  event: Electron.IpcMainEvent,
  loginWindow: BrowserWindow,
  responseData: {
    data: { accessToken: string; account: any; refreshToken: string; versionLatest: string }
  }
) {
  if (is.dev) {
    autoUpdater.forceDevUpdateConfig = true
    autoUpdater.setFeedURL({
      provider: 'generic',
      url:
        import.meta.env.VITE_BUILD_TARGET === 'BSoft'
          ? import.meta.env.VITE_URL_RELEASES
          : import.meta.env.VITE_URL_RELEASES_CORNERS
    })
  }

  autoUpdater.checkForUpdates()

  autoUpdater.on('checking-for-update', async () => {
    await systemLogToFile(`[Login] Checking for update...`, 'Program')

    console.log('Login: Checking for update...')
  })

  autoUpdater.on('update-available', async () => {
    await systemLogToFile(`[Login] Update-available...`, 'Program')

    console.log('Login: Update available, downloading...')
    if (loginWindow) {
      loginWindow.webContents.send('show-loading')
    }
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('update-not-available', async () => {
    await systemLogToFile(`[Login] Update-not-available...`, 'Program')

    console.log('Login: No update available.')
    proceedToLoadingWindow(event, loginWindow, responseData)
  })

  autoUpdater.on('error', async (err) => {
    await systemLogToFile(
      `[Login] CheckForUpdates: ERR_NAME_NOT_RESOLVED ${String(err)}`,
      'Program'
    )

    console.log('Login: AutoUpdater error:', err)
    proceedToLoadingWindow(event, loginWindow, responseData)
  })

  autoUpdater.on('download-progress', async (progress) => {
    await systemLogToFile(`[Login] Download-progress: ${Math.round(progress.percent)}%`, 'Program')

    console.log(`Login:  Downloading... ${Math.round(progress.percent)}%`)

    if (loginWindow) {
      loginWindow?.webContents.send('update-download-progress', Math.round(progress.percent))
    }
  })

  autoUpdater.on('update-downloaded', async () => {
    await systemLogToFile(`[Login] Update-downloaded.`, 'Program')

    console.log('Login: Update-downloaded')

    loginWindow?.webContents.send('update-downloaded')
    await new Promise((resolve) => setTimeout(resolve, 4000))
    autoUpdater.quitAndInstall(true, true)
  })
}

async function proceedToLoadingWindow(
  event: Electron.IpcMainEvent,
  loginWindow: BrowserWindow,
  responseData: {
    data: { accessToken: string; account: any; refreshToken: string; versionLatest: string }
  }
) {
  autoUpdater.removeAllListeners()
  await systemLogToFile(`Get /api/v1/user/auth/login: Response 200 OK`, 'Program')
  const { accessToken, account, refreshToken } = responseData.data

  event.reply('LoginResult', { success: true, message: 'success', data: responseData.data })
  event.reply('setToken', { accessToken, refreshToken })

  loginWindow?.close()
  const initAppWindow = createInitAppWindow()
  await Promise.all([
    fetchDataSystem(
      `${import.meta.env.VITE_URL}/user/platform`,
      Platform,
      (platform: { id: string; platformName: string; url: string }) => ({
        findCriteria: { name: platform.platformName },
        data: { uuid: platform.id, name: platform.platformName, url: platform.url }
      }),
      accessToken
    ),
    fetchDataSystem(
      `${import.meta.env.VITE_URL}/user/league`,
      NameLeague,
      (league: {
        leagueId: string
        leagueName: string
        standardLeagueName: null | string
        platformId: string
        platformName: string
        platformUrl: string
      }) => {
        const platform = Platform.findOne({ name: league.platformName }) as PlatformType
        if (!platform) return null
        return {
          findCriteria: {
            nameLeague: league.leagueName.trim(),
            platform: league.platformName,
            league: league.standardLeagueName
          },
          data: {
            nameLeague: league.leagueName.trim(),
            platform: league.platformName,
            idPlatform: platform.id,
            league: league.standardLeagueName
          }
        }
      },
      accessToken
    ),
    fetchDataSystem(
      `${import.meta.env.VITE_URL}/user/team`,
      NameTeam,
      (team: {
        teamId: string
        teamName: string
        standardTeamName: null | string
        platformId: string
        platformName: string
        platformUrl: string
        leagueId: string
        leagueName: string
        standardLeagueName: null | string
      }) => {
        const platform = Platform.findOne({ name: team.platformName }) as PlatformType
        if (!platform) return null
        return {
          findCriteria: {
            nameTeam: team.teamName.trim(),
            platform: team.platformName,
            nameLeague: team.leagueName.trim(),
            team: team.standardTeamName,
            league: team.standardLeagueName
          },
          data: {
            nameTeam: team.teamName.trim(),
            nameLeague: team.leagueName.trim(),
            platform: team.platformName,
            idPlatform: platform.id,
            team: team.standardTeamName,
            league: team.standardLeagueName
          }
        }
      },
      accessToken
    )
  ]).catch(async (error) => {
    console.error('Error in concurrent API calls:', error)
    await systemLogToFile(
      `Concurrent API calls failed: ${
        error instanceof Error ? error.message || 'Unknown error' : String(error)
      }`,
      'Error'
    )
  })

  const urlImage = isBSoft
    ? `${import.meta.env.VITE_URL}/user/system-config/announcement?appType=DEFAULT`
    : `${import.meta.env.VITE_URL}/user/system-config/announcement?appType=CORNER`

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`
  }

  const [responseApiImage] = await Promise.all([fetch(urlImage, { method: 'GET', headers })])

  const dataImage = (await responseApiImage.json()) as ResponseData<Announcement>

  initAppWindow.webContents.send('init-app-done')
  await delay(2000)

  mainWindow = await createMainWindow(account, accessToken)
  mainWindow.webContents.once('did-finish-load', () => {
    if (dataImage?.data.isEnable) {
      const popupA = createPopupImage(
        dataImage?.data?.announcementType,
        dataImage?.data?.content,
        import.meta.env.VITE_URL_IMAGE + dataImage?.data?.filePath
      )
      popupA.on('closed', () => {
        if (account.warningExpired) {
          mainWindow?.webContents.send('show-session-expire-popup', {
            expiredDate: account.expiredDate,
            autoCloseMs: 5000
          })
        }
      })
    } else {
      if (account.warningExpired) {
        mainWindow?.webContents.send('show-session-expire-popup', {
          expiredDate: account.expiredDate,
          autoCloseMs: 5000
        })
      }
    }

    initAppWindow.close()
  })

  initSocket(accessToken, 'en', mainWindow)
  createWorkerScheduledLoginSetting(mainWindow)
  createWorkerScheduledLogoutSetting(mainWindow)
}

app.on('second-instance', () => {
  if (loginWindow && !loginWindow.isDestroyed()) {
    if (loginWindow.isMinimized()) loginWindow.restore()
    loginWindow.focus()
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.whenReady().then(async () => {
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  loginWindow = createWindow()

  const clearTables = [
    'P88Bet',
    'Viva88Bet',
    'Sbobet',
    'WBet',
    'IIIin1Bet',
    'EventViva88',
    'LeagueViva88',
    'EventSbobet',
    'LeagueSbobet',
    'TicketDelaySec',
    'PerMatchLimit',
    'PerMatchLimitPlatform',
    'PerMatchDetail',
    'DataBet',
    'BetListResult',
    'WaitingList',
    'ContraList',
    'SuccessList'
  ]
  clearTables.forEach(clearTable)

  Account.update({}, DEFAULT_ACCOUNT_STATUS)

  const dataSetting = Setting.findAll() as SettingType[]
  if (!dataSetting.length) {
    Setting.create(DEFAULT_SETTING)
    Account.updateTypeCrawlForRefresh('Running')
  } else {
    Account.updateTypeCrawlForRefresh(dataSetting[0].gameType)
  }

  const settingTableView = SettingTableView.findAll() as unknown as SettingTableViewType[]
  if (!settingTableView.length) {
    SettingTableView.insertMany([
      { tab: 'BetList', contraStrategy: 'auto', clear: 1, scroll: 1 },
      { tab: 'WaitingList', contraStrategy: '', clear: 1, scroll: 1 },
      { tab: 'ContraList', contraStrategy: 'auto', clear: 1, scroll: 1 },
      { tab: 'SuccessList', contraStrategy: '', clear: 0, scroll: 0 }
    ])
  }

  const settingLeagueFilter = SettingLeagueFilter.findAll() as SettingLeagueFilterType[]
  if (!settingLeagueFilter.length) {
    SettingLeagueFilter.create({ filterType: 'Block', blockMajorLeague: 0, allowMajorLeague: 0 })
  }

  const loginSchedulerSetting = LoginSchedulerSetting.findAll() as LoginSchedulerSettingType[]
  if (!loginSchedulerSetting.length) {
    LoginSchedulerSetting.insertMany(LOGIN_SCHEDULER_SETTING)
  }
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    loginWindow = createWindow()
  }
})

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
