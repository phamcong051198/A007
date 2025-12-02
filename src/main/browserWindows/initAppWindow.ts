import { join } from 'path'

import { is } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'

export function createInitAppWindow() {
  const initAppWindow = new BrowserWindow({
    autoHideMenuBar: true,
    center: true,
    frame: false,
    height: 236,
    resizable: false,
    show: false,
    trafficLightPosition: { x: 15, y: 10 },
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    width: 440
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    initAppWindow.loadURL(
      `http://localhost:5173/#/initApp?version=${encodeURIComponent(`v${app.getVersion()}`)}`
    )
  } else {
    initAppWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: `initApp?version=${encodeURIComponent(`v${app.getVersion()}`)}`
    })
  }
  initAppWindow.webContents.once('did-finish-load', () => {
    initAppWindow.show()
  })

  return initAppWindow
}
