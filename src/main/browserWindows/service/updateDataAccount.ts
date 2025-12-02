import { Account, PerMatchLimit } from '@db/model'
import { BrowserWindow } from 'electron'

import { AccountType } from '@shared/common/types'

import { handleGetDataSportsBook } from '@/browserWindows/service/handleGetDataSportsBook'

interface UpdateAccountPayload {
  id: number
  loginID: string
  password: string
  limitMethod: string
  limitType: string
  totalAmount: string
  totalCount: string
}

export function updateDataAccount(
  activeId: string,
  account: UpdateAccountPayload,
  mainWindow: BrowserWindow
): void {
  const existing = Account.findById(account.id) as AccountType
  if (!existing) return

  const { id, loginID, password, limitMethod, limitType, totalAmount, totalCount } = account
  const credentialsChanged = existing.loginID !== loginID || existing.password !== password

  const baseUpdate = { loginID, password }
  const updateData = credentialsChanged
    ? {
        ...baseUpdate,
        checkBoxAutoLogin: 0,
        cookie: null,
        credit: '0',
        host: null,
        socketUrl: null,
        status: 'Login',
        statusLogin: null,
        textLog: null
      }
    : { ...baseUpdate, limitMethod, limitType, totalAmount, totalCount }

  Account.update({ id }, updateData)

  // === Handle PerMatchLimit update logic ===
  const methodChanged = limitMethod !== existing.limitMethod

  if (methodChanged) {
    PerMatchLimit.deleteMany({ idAccount: id })
  }

  // === Send latest sportsbook data to renderer ===
  const dataSportsBook = handleGetDataSportsBook(activeId)
  mainWindow.webContents.send('DataSportsBook', dataSportsBook)
}
