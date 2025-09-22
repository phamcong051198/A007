import { ElectronAPI } from '@electron-toolkit/preload'
import { Post } from '@shared/types'

declare global {
  interface Window {
    electron: ElectronAPI & {
      onForceLogout: (callback: (event, data) => void) => void
      onRefreshToken: (callback: (event, data) => void) => void
      syncExpiredDate: (callback: (event, data) => void) => void
      minimize: () => void
    }
  }
}
