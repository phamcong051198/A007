import { BrowserWindow } from 'electron'

import { setTimeout } from 'timers/promises'
import { handleLoginAccount } from '@/browserWindows/service/handleLoginLogoutAccount'
import { handleGetAccountBySportsBook } from '@/browserWindows/service/handleGetAccountBySportsBook'
import { platformPairStatusManager } from '@/worker/handlePairPlatform/manager'
import { AccountType } from '@shared/common/types'

export async function handleLoginAll(mainWindow: BrowserWindow, activeSportsBook: string) {
  const listAccount = handleGetAccountBySportsBook(activeSportsBook)
  if (!listAccount || !listAccount.length) return

  const accountNotLogin = listAccount.filter(
    (account) =>
      account.status == 'Login' && account.statusDelete == 0 && account.loginID && account.password
  ) as AccountType[]

  if (!accountNotLogin.length) return

  for (const account of accountNotLogin) {
    handleLoginAccount(account, mainWindow)
    await setTimeout(500)
  }

  platformPairStatusManager(mainWindow)
}
