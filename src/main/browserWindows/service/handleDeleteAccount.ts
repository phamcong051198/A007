import { BrowserWindow } from 'electron'
import { Account, PerMatchLimit, SportsBook } from '@db/model'
import { checkQueue } from '@/worker'
import { AccountType, SportsBookType } from '@shared/common/types'

export function handleDeleteAccount(
  mainWindow: BrowserWindow,
  account: AccountType,
  activeSportsBook: string
) {
  const infoAccount = Account.findById(account.id) as AccountType
  if (!infoAccount.statusPair) {
    Account.delete({ id: account.id })
  } else {
    Account.update({ id: account.id }, { statusDelete: 1 })
  }

  const listPlatformBySportsBook = SportsBook.findAll({
    name: activeSportsBook
  }) as SportsBookType[]
  const listAccount = Account.findAll({ statusDelete: 0 }) as AccountType[]

  const dataSportsBook = listPlatformBySportsBook.map((sportBook) => {
    const accounts = listAccount.filter((account) => account.platformName === sportBook.platform)
    return { ...sportBook, accounts }
  })

  PerMatchLimit.deleteMany({ idAccount: account.id })
  checkQueue(account)
  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
