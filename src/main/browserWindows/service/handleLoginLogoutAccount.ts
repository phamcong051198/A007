import { BrowserWindow } from 'electron'
import { AccountType } from '@shared/common/types'
import { enqueueWorker } from '@/worker'
import { Account, clearTable, PerMatchLimit } from '@db/model'
import { platformPairStatusManager } from '@/worker/handlePairPlatform/manager'
import { STATUS_ACCOUNT } from '@shared/main/constants'

export function handleLoginAccount(account: AccountType, mainWindow: BrowserWindow) {
  mainWindow.webContents.send(
    'DataUpdateAccount',
    Account.update(
      {
        id: account.id
      },
      { status: 'In-Progress', textLog: 'Waiting for login...' }
    )
  )
  PerMatchLimit.deleteMany({ idAccount: account.id })
  enqueueWorker(account, mainWindow)
  platformPairStatusManager(mainWindow)
}

export function handleLogoutAccount(account: AccountType, mainWindow: BrowserWindow) {
  mainWindow.webContents.send(
    'DataUpdateAccount',
    Account.update(
      {
        id: account.id
      },
      {
        credit: '0',
        checkBoxAutoLogin: 0,
        textLog: null,
        statusLogin: null,
        status: STATUS_ACCOUNT.LOGIN,
        cookie: null,
        socketUrl: null,
        host: null,
        parent_id: null
      }
    )
  )

  PerMatchLimit.deleteMany({ idAccount: account.id })
  const listAccount = Account.findAll({ platformName: account.platformName })
  const checkAccount = listAccount.findIndex((account) => account.status === STATUS_ACCOUNT.LOGOUT)
  if (checkAccount == -1) {
    clearTable(account.platformName)
  }
}
