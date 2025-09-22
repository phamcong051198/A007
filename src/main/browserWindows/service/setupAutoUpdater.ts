import { BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { systemLogToFile } from '@/worker/lib/systemLogToFile'

const AUTO_UPDATE_INTERVAL_MS = 1000 * 60 * 5 // 5 phút

export function setupAutoUpdater() {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

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

  const intervalId = setInterval(() => {
    autoUpdater.checkForUpdates()
  }, AUTO_UPDATE_INTERVAL_MS)

  autoUpdater.on('checking-for-update', async () => {
    await systemLogToFile(`[Main] Checking for update...`, 'Program')

    console.log('Main: Checking for update...')
  })

  autoUpdater.on('update-available', async () => {
    await systemLogToFile(`[Main] Update-available...`, 'Program')

    console.log('Main: Update available, downloading...')
    clearInterval(intervalId)
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('update-not-available', async () => {
    await systemLogToFile(`[Main] Update-not-available...`, 'Program')

    console.log('Main: No update available.')
  })

  autoUpdater.on('error', async (err) => {
    await systemLogToFile(`[Main] SetupAutoUpdater: ERR_NAME_NOT_RESOLVED`, 'Program')

    console.error('Main: AutoUpdater error:', err)
  })

  autoUpdater.on('download-progress', async (progress) => {
    await systemLogToFile(`[Main] Download-progress: ${Math.round(progress.percent)}%`, 'Program')

    console.log(`Main:  Downloading... ${Math.round(progress.percent)}%`)
  })

  autoUpdater.on('update-downloaded', async () => {
    await systemLogToFile(`[Main] Update-downloaded.`, 'Program')

    console.log('Main: Update downloaded. Will install on quit.')
    BrowserWindow.getAllWindows()[0].webContents.send('UpdateAvailable')
  })
}
