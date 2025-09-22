import { checkQueuePlatform } from '@/worker'
import { Account, PerMatchLimitPlatform, SettingPerMatchLimit, SportsBook } from '@db/model'
import { AccountType, SportsBookType } from '@shared/common/types'
import { BrowserWindow } from 'electron'

export function handleDeletePlatForm(
  mainWindow: BrowserWindow,
  namePlatform: string,
  activeSportsBook: string
) {
  Account.deleteMany({ platformName: namePlatform, statusPair: 0 })
  Account.updateMany({ platformName: namePlatform }, { statusDelete: 1 })

  SportsBook.delete({ platform: namePlatform })

  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]

  const listAccount = Account.findAll() as AccountType[]

  const dataSportsBook = listPlatformBySportsBook.map((sportBook) => {
    const accounts = listAccount.filter((account) => account.platformName === sportBook.platform)
    return { ...sportBook, accounts }
  })

  SettingPerMatchLimit.delete({ namePlatform })
  PerMatchLimitPlatform.deleteMany({ platform: namePlatform })

  checkQueuePlatform(namePlatform)
  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
