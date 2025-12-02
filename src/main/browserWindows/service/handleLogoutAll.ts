import { BrowserWindow } from 'electron'

import { AccountType } from '@shared/common/types'

import { handleGetAccountBySportsBook } from '@/browserWindows/service/handleGetAccountBySportsBook'
import { handleGetDataSportsBook } from '@/browserWindows/service/handleGetDataSportsBook'
import { handleLogoutAccount } from '@/browserWindows/service/handleLoginLogoutAccount'

export function handleLogoutAll(mainWindow: BrowserWindow, activeSportsBook: string) {
  const listAccount = handleGetAccountBySportsBook(activeSportsBook)
  if (!listAccount || !listAccount.length) return

  const accountNotLogin = listAccount.filter(
    ({ status, statusDelete, loginID, password }) =>
      status !== 'In-Progress' && status !== 'Login' && statusDelete === 0 && loginID && password
  ) as AccountType[]

  if (!accountNotLogin.length) return
  for (const account of accountNotLogin) {
    handleLogoutAccount(account, mainWindow)
  }

  mainWindow.webContents.send('GetDataSportsBookUpdate', handleGetDataSportsBook(activeSportsBook))
}
