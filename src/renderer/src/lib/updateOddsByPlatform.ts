import { AccountPairType } from '@shared/common/types'

export function updateOddsByPlatform(
  listCombination: AccountPairType[],
  listPlatform: { platform: string; checkOdd: number; oddFrom: string; oddTo: string }[]
): AccountPairType[] {
  const platformMap = new Map(listPlatform.map((item) => [item.platform.toLowerCase(), item]))

  return listCombination.map((pair) => {
    const updatedPair = { ...pair }

    for (const key of ['account1', 'account2'] as const) {
      const originalAcc = pair[key]
      const match = platformMap.get(originalAcc.platform.toLowerCase())

      updatedPair[key] = { ...originalAcc }
      if (match) {
        updatedPair[key].checkOdd = match.checkOdd
        updatedPair[key].oddFrom = match.oddFrom
        updatedPair[key].oddTo = match.oddTo
      }
    }

    return updatedPair
  })
}
