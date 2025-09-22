import { handleGetDataSportsBook } from '@/browserWindows/service/handleGetDataSportsBook'
import { Account } from '@db/model'
import { AccountType } from '@shared/common/types'
import { BrowserWindow } from 'electron'

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
          loginID: account.loginID,
          password: account.password,
          credit: '0',
          checkBoxAutoLogin: 0,
          textLog: null,
          statusLogin: null,
          status: 'Login',
          cookie: null,
          socketUrl: null,
          host: null,
          customIP: account.customIP,
          proxyIP: account.proxyIP,
          proxyPort: account.proxyPort,
          proxyUsername: account.proxyUsername,
          proxyPassword: account.proxyPassword,
          proxyScope: account.proxyScope
        }
      )
    } else {
      Account.update(
        { id: account.id },
        {
          loginID: account.loginID,
          password: account.password,
          customIP: account.customIP,
          proxyIP: account.proxyIP,
          proxyPort: account.proxyPort,
          proxyUsername: account.proxyUsername,
          proxyPassword: account.proxyPassword,
          proxyScope: account.proxyScope,
          orderNumber: account.orderNumber
        }
      )
    }
  }

  const dataSportsBook = handleGetDataSportsBook(activeSportsBook)
  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
