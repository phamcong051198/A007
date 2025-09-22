import { handleDelayLogin } from '@/browserWindows/service/handleDelayLogin'
import { SportsBook } from '@db/model'
import { SportsBookType } from '@shared/common/types'
import { BrowserWindow } from 'electron'

export const handleDelayLoginAll = (mainWindow: BrowserWindow, activeSportsBook: string) => {
  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]

  for (const platformBySportsBook of listPlatformBySportsBook) {
    handleDelayLogin(mainWindow, platformBySportsBook.platform)
  }
}
