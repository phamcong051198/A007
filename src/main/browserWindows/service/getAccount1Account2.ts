import { Account } from '@db/model'
import { AccountType } from '@shared/common/types'

export function GetAccount1Account2() {
  const listAccount = Account.findAll() as AccountType[]
  const filterListAccount = listAccount.filter((account) => account.loginID && account.password)

  filterListAccount.sort((account1, account2) => {
    const platformCompare = account1.platformName.localeCompare(account2.platformName)
    if (platformCompare !== 0) return platformCompare
    return account1.loginID.localeCompare(account2.loginID)
  })

  return filterListAccount
}
