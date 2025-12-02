import { Account, clearTable, PerMatchLimit } from '@db/model'
import { BrowserWindow } from 'electron'

import { AccountType } from '@shared/common/types'
import { STATUS_ACCOUNT } from '@shared/main/constants'

import { enqueueWorker } from '@/worker'
import { platformPairStatusManager } from '@/worker/handlePairPlatform/manager'

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
        checkBoxAutoLogin: 0,
        cookie: null,
        credit: '0',
        host: null,
        parent_id: null,
        socketUrl: null,
        status: STATUS_ACCOUNT.LOGIN,
        statusLogin: null,
        textLog: null
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
