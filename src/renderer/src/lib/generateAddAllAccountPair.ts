/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid'

import { generateAccountData } from '@renderer/lib/generateAccountData'

import { AccountType } from '@shared/common/types'

export function generateAddAllAccountPair(listAccount: AccountType[]) {
  const result: any[] = []

  listAccount.forEach((account1, index1) => {
    listAccount.slice(index1 + 1).forEach((account2) => {
      const acc1Data = generateAccountData(account1)
      const acc2Data = generateAccountData(account2)

      // Bỏ qua nếu cùng platform
      if (acc1Data.platform === acc2Data.platform) return

      result.push({
        account1: acc1Data,
        account2: acc2Data,
        id: uuidv4(),
        isValid: 1,
        key: `${acc1Data.platform}_${acc2Data.platform}`
      })
    })
  })

  return result
}
