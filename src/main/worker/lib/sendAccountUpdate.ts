import { Account } from '@db/model'
import { BrowserWindow } from 'electron'

import { AccountType } from '@shared/common/types'

export function sendAccountUpdate(accountId: number, mainWindow: BrowserWindow) {
  const account = Account.findOne({ id: accountId, statusDelete: 0 }) as AccountType

  if (account && account.status !== 'Login') {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('DataUpdateAccount', account)
    }
  }
}
