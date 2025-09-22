import { checkBetLimitPlatform } from '@/worker/lib/checkBetLimitPlatform'
import { checkMatchLeagueFilterRule } from '@/worker/lib/checkMatchLeagueFilterRule'
import { DataCrawlType } from '@shared/common/types'

export function isValidData(data: DataCrawlType): boolean {
  if (!data?.league || !data?.home || !data?.away) return false
  if (checkMatchLeagueFilterRule(data.league)) return false
  if (
    checkBetLimitPlatform({
      league: data.league,
      home: data.home,
      away: data.away,
      platform: data.platform
    })
  )
    return false

  return true
}
