import { AccountSwitchType, AccountType } from '@shared/common/types'
let runCount = 0

export const switchProxy = (list1: AccountType[], list2: AccountSwitchType[], type: string) => {
  if (list1.length === 0 || list2.length === 0) {
    return { accountResult1: null, accountResult2: list2 }
  }

  let foundIndex = -1

  for (let i = 0; i < list1.length; i++) {
    const indexToCheck = (runCount + i) % list1.length
    const account = list1[indexToCheck]
    if (account.status !== 'Logout') {
      continue
    }
    if (
      (type === 'Betting' && account.checkBoxBet === 1) ||
      (type === 'Refresh' && account.checkBoxRefresh === 1) ||
      type === 'All'
    ) {
      foundIndex = indexToCheck
      break
    }
  }

  if (foundIndex === -1) {
    return { accountResult1: null, accountResult2: list2 }
  }
  runCount = (foundIndex + 1) % list1.length
  const runIndex = foundIndex
  const replacementAccount = list2.shift()

  if (!replacementAccount) {
    return { accountResult1: null, accountResult2: list2 }
  }

  list2.push({
    loginID: list1[runIndex].loginID,
    password: list1[runIndex].password,
    loginURL: list1[runIndex].loginURL,
    customIP: list1[runIndex].customIP,
    proxyIP: list1[runIndex].proxyIP,
    proxyPort: list1[runIndex].proxyPort,
    proxyUsername: list1[runIndex].proxyUsername,
    proxyPassword: list1[runIndex].proxyPassword,
    proxyScope: list1[runIndex].proxyScope
  })

  const updatedAccount = {
    ...list1[runIndex],
    loginID: replacementAccount.loginID,
    loginURL: replacementAccount.loginURL,
    password: replacementAccount.password,
    customIP: replacementAccount.customIP,
    proxyIP: replacementAccount.proxyIP,
    proxyPort: replacementAccount.proxyPort,
    proxyUsername: replacementAccount.proxyUsername,
    proxyPassword: replacementAccount.proxyPassword,
    proxyScope: replacementAccount.proxyScope
  }

  list1[runIndex] = updatedAccount

  return { accountResult1: updatedAccount, accountResult2: [...list2] }
}
