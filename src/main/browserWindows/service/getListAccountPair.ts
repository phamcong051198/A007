import { Account, AccountPair } from '@db/model'
import { AccountPairType, AccountType } from '@shared/common/types'

export function GetListAccountPair(): AccountPairType[] {
  const accountPair = AccountPair.findAll()
  if (!accountPair.length) {
    return []
  }
  const listAccount = Account.findAll() as AccountType[]
  const listAccountPair = accountPair.map((item) => {
    return {
      id: item.id,
      isValid: item.isValid,
      key: item.key,
      account1: item.account1 ? JSON.parse(String(item.account1)) : {},
      account2: item.account2 ? JSON.parse(String(item.account2)) : {}
    }
  }) as AccountPairType[]

  return listAccountPair.map((pair) => {
    const updatedAccount1 = listAccount.find((acc) => acc.id === pair.account1.id)
    const updatedAccount2 = listAccount.find((acc) => acc.id === pair.account2.id)

    return {
      ...pair,
      account1: {
        ...pair.account1,
        loginID: updatedAccount1?.loginID || pair.account1.loginID
      },
      account2: {
        ...pair.account2,
        loginID: updatedAccount2?.loginID || pair.account2.loginID
      }
    }
  })
}
