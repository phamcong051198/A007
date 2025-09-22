import { v4 as uuidv4 } from 'uuid'
import { AccountType } from '@shared/common/types'
import { generateAccountData } from '@renderer/lib/generateAccountData'

export function generateAddAllAccountPair(listAccount: AccountType[]) {
  return listAccount.flatMap((account1, index) =>
    listAccount.slice(index).map((account2) => {
      const acc1Data = generateAccountData(account1)
      const acc2Data = generateAccountData(account2)
      const isValid = acc1Data.platform === acc2Data.platform ? 0 : 1
      const key = `${acc1Data.platform}_${acc2Data.platform}`

      return {
        id: uuidv4() as string,
        isValid,
        key,
        account1: acc1Data,
        account2: acc2Data
      }
    })
  )
}
