import { handleGetDataSportsBook } from '@/browserWindows/service/handleGetDataSportsBook'
import { Account, PerMatchLimit } from '@db/model'
import { AccountType } from '@shared/common/types'
import { BrowserWindow } from 'electron'

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
        credit: '0',
        checkBoxAutoLogin: 0,
        textLog: null,
        statusLogin: null,
        status: 'Login',
        cookie: null,
        socketUrl: null,
        host: null
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
