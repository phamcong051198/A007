import { Account } from '@db/model'
import { BrowserWindow } from 'electron'

import { AccountType } from '@shared/common/types'

import { handleGetDataSportsBook } from '@/browserWindows/service/handleGetDataSportsBook'

export function updateDataListAccount(
  dataAccountInfo: AccountType[],
  mainWindow: BrowserWindow,
  activeSportsBook: string
) {
  for (const account of dataAccountInfo) {
    const existing = Account.findById(account.id) as AccountType
    if (!existing) continue

    const shouldReset =
      existing.loginID !== account.loginID ||
      existing.password !== account.password ||
      existing.customIP !== account.customIP ||
      existing.proxyIP !== account.proxyIP ||
      existing.proxyPort !== account.proxyPort ||
      existing.proxyUsername !== account.proxyUsername ||
      existing.proxyPassword !== account.proxyPassword ||
      existing.proxyScope !== account.proxyScope

    if (shouldReset) {
      Account.update(
        { id: account.id },
        {
          checkBoxAutoLogin: 0,
          cookie: null,
          credit: '0',
          customIP: account.customIP,
          host: null,
          loginID: account.loginID,
          password: account.password,
          proxyIP: account.proxyIP,
          proxyPassword: account.proxyPassword,
          proxyPort: account.proxyPort,
          proxyScope: account.proxyScope,
          proxyUsername: account.proxyUsername,
          socketUrl: null,
          status: 'Login',
          statusLogin: null,
          textLog: null
        }
      )
    } else {
      Account.update(
        { id: account.id },
        {
          customIP: account.customIP,
          loginID: account.loginID,
          orderNumber: account.orderNumber,
          password: account.password,
          proxyIP: account.proxyIP,
          proxyPassword: account.proxyPassword,
          proxyPort: account.proxyPort,
          proxyScope: account.proxyScope,
          proxyUsername: account.proxyUsername
        }
      )
    }
  }

  const dataSportsBook = handleGetDataSportsBook(activeSportsBook)
  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
