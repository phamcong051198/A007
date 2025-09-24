/* eslint-disable @typescript-eslint/no-explicit-any */
import { is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import {
  Account,
  clearTable,
  Platform,
  Setting,
  SettingLeagueFilter,
  SettingTableView
} from '@db/model'
import { SettingTableViewType } from '@shared/common/types'
import { DEFAULT_ACCOUNT_STATUS, DEFAULT_SETTING, PLATFORM_DATA } from '@shared/main/constants'
import { SettingLeagueFilterType, SettingType } from '@shared/common/types'
import { createMainWindow } from '@/browserWindows/mainWindow'

let loginWindow: BrowserWindow | null = null
let mainWindow: BrowserWindow | null = null

app.setAppUserModelId('A007-appId')

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

  ipcMain.on('AttemptLogin', async (event, { username, password }) => {
    if (username == import.meta.env.VITE_BUILD_U && password == import.meta.env.VITE_BUILD_P) {
      const account = {
        username
      }
      event.reply('LoginResult', { success: true })

      loginWindow.close()

      mainWindow = await createMainWindow(account)
      if (!Platform.count()) {
        Platform.insertMany(PLATFORM_DATA)
      }
      return
    }
    return event.reply('LoginResult', { success: false, message: 'Invalid credentials.' })
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
