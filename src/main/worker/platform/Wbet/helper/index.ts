import zlib from 'zlib'

import fetch from 'node-fetch'

import { GAME_TYPES } from '@shared/common/constants'
import { AccountType, LeagueType } from '@shared/common/types'
import { PLATFORM, TYPE_ODD, TYPE_ODD_DETAIL } from '@shared/main/constants'

import {
  ARGUMENTS_UX_MARKET,
  ARGUMENTS_UX_MATCH,
  REVERSE_CONVERT_ODDS,
  TYPE_ODD_HDP,
  TYPE_ODD_OU
} from '@/worker/platform/Wbet/common/constants'

export const buildBodyBalance = (account: AccountType) => {
  return {
    account_id: account.loginID,
    session_token: account.cookie
  }
}

export const buildBodyMarket = (gameType: string, account: AccountType) => {
  return {
    account_id: account.loginID,
    arguments: ARGUMENTS_UX_MARKET[gameType],
    session_token: account.cookie
  }
}

export const buildBodyMatch = (gameType: string, account: AccountType, matchs) => {
  return {
    account_id: account.loginID,
    arguments: ARGUMENTS_UX_MATCH[gameType],
    ids: matchs.map((match) => match[0]).join('|'),
    mmo: 'ODDS',
    session_token: account.cookie
  }
}

export async function fetchJsonWithDecompress(url: string, account: AccountType, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'accept-encoding': 'gzip, deflate, br',
      'content-type': 'application/json',
      origin: 'https://true88.com',
      referer: 'https://true88.com/',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
    }
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  const text = buffer.toString('utf-8')

  // 🟢 TH1: thử parse trực tiếp JSON
  try {
    return JSON.parse(text)
  } catch {
    // không phải JSON → có thể là base64 gzip
  }

  // 🟢 TH2: nếu bắt đầu bằng "H4sI" thì decode base64 rồi gunzip
  if (text.startsWith('H4sI')) {
    const gzBuffer = Buffer.from(text, 'base64')
    const decompressed = zlib.gunzipSync(gzBuffer).toString('utf-8')
    return JSON.parse(decompressed)
  }

  // 🟢 TH3: fallback inflate
  try {
    const inflated = zlib.inflateSync(buffer).toString('utf-8')
    return JSON.parse(inflated)
  } catch {
    throw new Error('Response is not valid JSON or gzip/base64 JSON: ' + text.slice(0, 200))
  }
}
function round(value: number, decimals = 2): number {
  return Number(value.toFixed(decimals))
}

export async function handleDataOdds_HDP(
  League_WBet,
  dataOdds_HDP,
  leagues,
  matchs,
  gameType,
  WBet
) {
  for (const key in dataOdds_HDP) {
    const arr = dataOdds_HDP[key]

    await Promise.all(
      arr.map((item) => {
        const idLeague = item[0]
        const idEvent = item[1]

        const submatch_id = item[2]
        const altLineId = item[3]
        const time_odd = item[4]
        const index = item[7]
        const odd =
          index == 1
            ? -Number(REVERSE_CONVERT_ODDS[item[8]])
            : Number(REVERSE_CONVERT_ODDS[item[8]])

        const homeIndex = index === 1 ? 10 : 9
        const awayIndex = index === 1 ? 9 : 10

        const price_home = round(Number(item[homeIndex]) * 0.1)
        const price_away = round(Number(item[awayIndex]) * 0.1)

        //Tên giải đấu
        const league = leagues.find((league) => league[0] === idLeague)
        const nameLeague = league ? league[4].trim() : 'Unknown League'

        // Tên trận đấu
        const match = matchs.find((match) => match[0] === idEvent)
        const nameHome = match ? match[5].trim() : 'Unknown Home Team'
        const nameAway = match ? match[6].trim() : 'Unknown Away Team'

        if (nameLeague?.includes(' - ')) return

        const league_WBet = League_WBet.findOne({ nameLeague }) as LeagueType
        if (!league_WBet) {
          const newLeague: Partial<LeagueType> = {
            idLeague,
            league: nameLeague.toUpperCase(),
            nameLeague
          }

          League_WBet.create(newLeague)
          return
        }
        if (league_WBet && !league_WBet.league) return

        const score = GAME_TYPES.RUNNING == gameType ? match[11] : null
        const stat = GAME_TYPES.RUNNING == gameType ? match[12] : null

        const marketSelectionId_home_over = match[22]
        const marketSelectionId_away_under = match[23]

        WBet.create({
          HDP: item[8],
          altLineId,
          away: nameAway.toUpperCase(),
          away_under: price_away,
          hdp_point: Number(odd),
          home: nameHome.toUpperCase(),
          home_over: price_home,
          idEvent,
          idLeague,
          league: league_WBet?.league || '',
          marketSelectionId_away_under,
          marketSelectionId_home_over,
          nameAway,
          nameHome,
          nameLeague,
          number: TYPE_ODD_HDP[time_odd],
          platform: PLATFORM.WBET,
          score,
          specialOdd: 5,
          stat,
          submatch_id,
          type: TYPE_ODD.HDP,
          typeOdd: TYPE_ODD_DETAIL.HDP
        })
      })
    )
  }
}

export async function handleDataOdds_OU(League_WBet, dataOdds_OU, leagues, matchs, gameType, WBet) {
  for (const key in dataOdds_OU) {
    const arr = dataOdds_OU[key]

    await Promise.all(
      arr.map((item) => {
        const idLeague = item[0]
        const idEvent = item[1]
        const submatch_id = item[2]
        const altLineId = item[3]
        const time_odd = item[4]
        const odd = Number(REVERSE_CONVERT_ODDS[item[8]])

        const price_home = round(Number(item[12]) * 0.1)
        const price_away = round(Number(item[11]) * 0.1)

        //Tên giải đấu
        const league = leagues.find((league) => league[0] === idLeague)
        const nameLeague = league ? league[4].trim() : 'Unknown League'

        // Tên trận đấu
        const match = matchs.find((match) => match[0] === idEvent)
        const nameHome = match ? match[5].trim() : 'Unknown Home Team'
        const nameAway = match ? match[6].trim() : 'Unknown Away Team'

        if (nameLeague?.includes(' - ')) return

        const league_WBet = League_WBet.findOne({ nameLeague }) as LeagueType
        if (!league_WBet) {
          const newLeague: Partial<LeagueType> = {
            idLeague,
            league: nameLeague.toUpperCase(),
            nameLeague
          }

          League_WBet.create(newLeague)
          return
        }
        if (league_WBet && !league_WBet.league) return

        const score = GAME_TYPES.RUNNING == gameType ? match[11] : null
        const stat = GAME_TYPES.RUNNING == gameType ? match[12] : null

        const marketSelectionId_home_over = match[22]
        const marketSelectionId_away_under = match[23]

        WBet.create({
          HDP: item[8],
          altLineId,
          away: nameAway.toUpperCase(),
          away_under: price_away,
          hdp_point: Number(odd),
          home: nameHome.toUpperCase(),
          home_over: price_home,
          idEvent,
          idLeague,
          league: league_WBet?.league || '',
          marketSelectionId_away_under,
          marketSelectionId_home_over,
          nameAway,
          nameHome,
          nameLeague,
          number: TYPE_ODD_OU[time_odd],
          platform: PLATFORM.WBET,
          score,
          specialOdd: 7,
          stat,
          submatch_id,
          type: TYPE_ODD.OU,
          typeOdd: TYPE_ODD_DETAIL.OU
        })
      })
    )
  }
}
