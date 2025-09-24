import fetch from 'node-fetch'
import zlib from 'zlib'

import { AccountType, NameTeamType } from '@shared/common/types'
import {
  ARGUMENTS_UX_MARKET,
  ARGUMENTS_UX_MATCH,
  REVERSE_CONVERT_ODDS,
  TYPE_ODD_HDP,
  TYPE_ODD_OU
} from '@/worker/platform/Wbet/common/constants'
import { Account, NameTeam } from '@db/model'
import { GAME_TYPES } from '@shared/common/constants'
import {
  PLATFORM,
  STATUS_ACCOUNT,
  STATUS_LOGIN,
  TYPE_ODD,
  TYPE_ODD_DETAIL
} from '@shared/main/constants'
import { isAccountActive } from '@/worker/lib/checkAccount'

export const buildBodyBalance = (account: AccountType) => {
  return {
    account_id: account.loginID,
    session_token: account.cookie
  }
}

export const buildBodyMarket = (gameType: string, account: AccountType) => {
  return {
    account_id: account.loginID,
    session_token: account.cookie,
    arguments: ARGUMENTS_UX_MARKET[gameType]
  }
}

export const buildBodyMatch = (gameType: string, account: AccountType, matchs) => {
  return {
    account_id: account.loginID,
    session_token: account.cookie,
    arguments: ARGUMENTS_UX_MATCH[gameType],
    ids: matchs.map((match) => match[0]).join('|'),
    mmo: 'ODDS'
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

export async function handleDataOdds_HDP(dataOdds_HDP, leagues, matchs, isBSoft, gameType, WBet) {
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
        const nameLeague = league ? league[4] : 'Unknown League'

        // Tên trận đấu
        const match = matchs.find((match) => match[0] === idEvent)
        const nameHome = match ? match[5] : 'Unknown Home Team'
        const nameAway = match ? match[6] : 'Unknown Away Team'

        if (isBSoft) {
          if (nameLeague?.includes('-')) return
        } else {
          if (!nameLeague?.toUpperCase().includes('CORNERS') || nameHome.includes('1st Corner'))
            return
        }

        const standardHomeName = NameTeam.findOne({
          nameTeam: isBSoft ? nameHome : nameHome.replace(/ No\.of Corners$/, ''),
          nameLeague: isBSoft ? nameLeague : nameLeague.replace(/ - CORNERS$/, ''),
          platform: PLATFORM.WBET
        }) as NameTeamType
        if (!standardHomeName || !standardHomeName.team || !standardHomeName.league) return

        const standardAwayName = NameTeam.findOne({
          nameTeam: isBSoft ? nameAway : nameAway.replace(/ No\.of Corners$/, ''),
          nameLeague: isBSoft ? nameLeague : nameLeague.replace(/ - CORNERS$/, ''),
          platform: PLATFORM.WBET
        }) as NameTeamType
        if (!standardAwayName || !standardAwayName.team || !standardAwayName.league) return

        const score = GAME_TYPES.RUNNING == gameType ? match[11] : null
        const stat = GAME_TYPES.RUNNING == gameType ? match[12] : null

        const marketSelectionId_home_over = match[22]
        const marketSelectionId_away_under = match[23]

        WBet.create({
          platform: PLATFORM.WBET,
          idLeague,
          nameLeague,
          idEvent,
          nameHome,
          nameAway,
          league: standardHomeName?.league || '',
          home: standardHomeName?.team || '',
          away: standardAwayName?.team || '',
          number: TYPE_ODD_HDP[time_odd],
          score,
          stat,
          hdp_point: Number(odd),
          home_over: price_home,
          away_under: price_away,
          type: TYPE_ODD.HDP,
          typeOdd: TYPE_ODD_DETAIL.HDP,
          HDP: item[8],
          marketSelectionId_home_over,
          marketSelectionId_away_under,
          altLineId,
          submatch_id,
          specialOdd: 5
        })
      })
    )
  }
}

export async function handleDataOdds_OU(dataOdds_OU, leagues, matchs, isBSoft, gameType, WBet) {
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
        const nameLeague = league ? league[4] : 'Unknown League'
        // Tên trận đấu
        const match = matchs.find((match) => match[0] === idEvent)
        const nameHome = match ? match[5] : 'Unknown Home Team'
        const nameAway = match ? match[6] : 'Unknown Away Team'

        if (isBSoft) {
          if (nameLeague?.includes('-')) return
        } else {
          if (!nameLeague?.toUpperCase().includes('CORNERS') || nameHome.includes('1st Corner'))
            return
        }

        const standardHomeName = NameTeam.findOne({
          nameTeam: isBSoft ? nameHome : nameHome.replace(/ No\.of Corners$/, ''),
          nameLeague: isBSoft ? nameLeague : nameLeague.replace(/ - CORNERS$/, ''),
          platform: PLATFORM.WBET
        }) as NameTeamType
        if (!standardHomeName || !standardHomeName.team || !standardHomeName.league) return

        const standardAwayName = NameTeam.findOne({
          nameTeam: isBSoft ? nameAway : nameAway.replace(/ No\.of Corners$/, ''),
          nameLeague: isBSoft ? nameLeague : nameLeague.replace(/ - CORNERS$/, ''),
          platform: PLATFORM.WBET
        }) as NameTeamType
        if (!standardAwayName || !standardAwayName.team || !standardAwayName.league) return

        const score = GAME_TYPES.RUNNING == gameType ? match[11] : null
        const stat = GAME_TYPES.RUNNING == gameType ? match[12] : null

        const marketSelectionId_home_over = match[22]
        const marketSelectionId_away_under = match[23]

        WBet.create({
          platform: PLATFORM.WBET,
          idLeague,
          nameLeague,
          idEvent,
          nameHome,
          nameAway,
          league: standardHomeName?.league || '',
          home: standardHomeName?.team || '',
          away: standardAwayName?.team || '',
          number: TYPE_ODD_OU[time_odd],
          score,
          stat,
          hdp_point: Number(odd),
          home_over: price_home,
          away_under: price_away,
          type: TYPE_ODD.OU,
          typeOdd: TYPE_ODD_DETAIL.OU,
          HDP: item[8],
          marketSelectionId_home_over,
          marketSelectionId_away_under,
          altLineId,
          submatch_id,
          specialOdd: 7
        })
      })
    )
  }
}
