import { ElectronAPI } from '@electron-toolkit/preload'
import { Post } from '@shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
