import { AccountPairType } from '@shared/common/types'

export function getPlatforms(
  accounts: AccountPairType[],
  type: 'QuickAmountSetting'
): { platform: string; betAmount: string }[]
export function getPlatforms(
  accounts: AccountPairType[],
  type: 'QuickOddsRangeSetting'
): { platform: string; checkOdd: number; oddFrom: string; oddTo: string }[]

export function getPlatforms(accounts: AccountPairType[], type: string) {
  const platformSet = new Set<string>()

  accounts.forEach(({ account1, account2 }) => {
    platformSet.add(account1.platform)
    platformSet.add(account2.platform)
  })

  if (type == 'QuickOddsRangeSetting') {
    return Array.from(platformSet).map((platform) => ({
      platform,
      checkOdd: 0,
      oddFrom: '0.01',
      oddTo: '-0.01'
    }))
  } else {
    return Array.from(platformSet).map((platform) => ({
      platform,
      betAmount: '0'
    }))
  }
}
