import { Account } from '@db/model'
import { AccountType } from '@shared/common/types'
import { BrowserWindow } from 'electron'

export function sendAccountUpdate(accountId: number, mainWindow: BrowserWindow) {
  const account = Account.findOne({ id: accountId, statusDelete: 0 }) as AccountType

  if (account && account.status !== 'Login') {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('DataUpdateAccount', account)
    }
  }
}
