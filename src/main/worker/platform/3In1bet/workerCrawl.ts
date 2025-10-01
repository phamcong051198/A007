/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-constant-condition */
import { HttpsProxyAgent } from 'https-proxy-agent'
import { setTimeout } from 'timers/promises'
import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { Account, clearTable, createModel, Setting } from '@db/model'
import { AccountType, LeagueType, SettingType } from '@shared/common/types'
import { parentPort } from 'worker_threads'
import { isAccountActive } from '@/worker/lib/checkAccount'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import {
  OPTIONS_PROXY,
  PLATFORM,
  STATUS_ACCOUNT,
  STATUS_LOGIN,
  TYPE_ODD,
  TYPE_ODD_DETAIL
} from '@shared/main/constants'
import { CONVERT_HDP, GAME_TYPES } from '@shared/common/constants'
import {
  API_BASE_URL,
  API_ENDPOINTS,
  REFERER_DATA_ODDS
} from '@/worker/platform/3In1bet/common/constants'
import {
  DataOddsEarly,
  DataOddsNormal,
  DataOddsResponse,
  UserInfoResponse
} from '@/worker/platform/3In1bet/common/types'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { createPayload, isArError } from '@/worker/platform/3In1bet/helper'
import rootLeagueSchema from '@db/schema/rootLeague'

let gameType: string | null = null

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async (action: string) => {
  if (action === 'Start') {
    try {
      await handleCrawlData()
    } catch (error) {
      await accountLogToFile(
        'Error handleCrawlData Wbet',
        PLATFORM['3IN1BET'],
        JSON.stringify(error),
        'Program'
      )
    }
  }
})

const handleCrawlData = async () => {
  while (true) {
    const listAccount = Account.findAll({
      platformName: PLATFORM['3IN1BET'],
      status: STATUS_ACCOUNT.LOGOUT,
      statusLogin: STATUS_LOGIN.SUCCESS,
      statusDelete: 0
    }) as AccountType[]

    if (!listAccount.length) {
      await setTimeout(1000)
      continue
    }

    for (const account of listAccount) {
      await fnCrawlData(account)
      await setTimeout(5000)
    }
  }
}

const fnCrawlData = async (account: AccountType) => {
  const settings = Setting.findAll() as SettingType[]
  if (!settings.length) return

  gameType = settings[0].gameType
  if (!gameType || gameType === GAME_TYPES.NONE) return

  const accountInfo = Account.findOne({
    id: account.id,
    statusDelete: 0,
    status: STATUS_ACCOUNT.LOGOUT,
    statusLogin: STATUS_LOGIN.SUCCESS
  }) as AccountType
  if (!accountInfo) return

  if (accountInfo.typeCrawl !== gameType) {
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `GameType changed, refresh to sync.`,
      'Program'
    )

    isAccountActive(account.id) &&
      Account.update(
        { id: account.id },
        {
          status: STATUS_ACCOUNT.EXIT,
          textLog: 'GameType changed, check box refresh to sync.'
        }
      ) &&
      port.postMessage({
        type: 'DataUpdateAccount',
        idAccount: account.id
      })

    return
  }

  const { status, data } = isProxyConfigValid(account)
  const { newIpAddress, newPort, newUsername, newPassword } = data

  const proxyUrl =
    status && account.proxyScope !== OPTIONS_PROXY.NONE
      ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
      : undefined

  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined
  const payload = new URLSearchParams(createPayload(gameType))

  try {
    const arRes = await fetch(API_ENDPOINTS.AR, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: API_BASE_URL,
        Referer: API_BASE_URL + '/main/index.aspx',
        Cookie: account.cookie,
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      ...(proxyAgent && { agent: proxyAgent }),
      body: JSON.stringify({
        a: '',
        r: ''
      })
    })

    if (!arRes.ok) {
      throw new Error(`Request failed ${arRes.status}`)
    }
    const arResJson: unknown = await arRes.json()

    if (isArError(arResJson) && arResJson.Au === 0) {
      if (account.checkBoxAutoLogin == 1) {
        isAccountActive(account.id) &&
          Account.update(
            { id: account.id },
            {
              statusLogin: STATUS_LOGIN.FAIL,
              textLog: 'Logged Again ...',
              credit: '0',
              cookie: null,
              host: null,
              socketUrl: null
            }
          ) &&
          port.postMessage({
            type: 'LoggedAgain',
            idAccount: account.id
          })
      } else {
        isAccountActive(account.id) &&
          Account.update(
            { id: account.id },
            {
              status: STATUS_ACCOUNT.EXIT,
              textLog: 'Your account has been log off due to multiple login'
            }
          ) &&
          port.postMessage({
            type: 'DataUpdateAccount',
            idAccount: account.id
          })
      }

      return
    }

    const userInfoRes = await fetch(API_ENDPOINTS.USER_INFO_PANEL_HOST, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: API_BASE_URL,
        Referer: API_BASE_URL + '/main/index.aspx',
        Cookie: account.cookie,
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      ...(proxyAgent && { agent: proxyAgent })
    })
    if (!userInfoRes.ok) {
      throw new Error(`Request failed ${userInfoRes.status}`)
    }

    const userInfoJson: unknown = await userInfoRes.json()
    const userInfo = userInfoJson as Partial<UserInfoResponse>

    if (!userInfo || !('BetCredit' in userInfo)) {
      throw new Error('Data userInfo is invalid or missing BetCredit property')
    }

    isAccountActive(account.id) &&
      Account.update(
        { id: account.id },
        {
          credit: String(userInfo.BetCredit ?? '0')
        }
      ) &&
      port.postMessage({
        type: 'DataUpdateAccount',
        idAccount: account.id
      })

    const res = await fetch(API_ENDPOINTS.DATA_ODDS, {
      method: 'POST',
      ...(proxyAgent && { agent: proxyAgent }),
      headers: {
        accept: 'application/json, text/javascript, */*',
        'accept-language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7',
        'content-type': 'application/json; charset=UTF-8',
        cookie: account.cookie,
        origin: API_BASE_URL,
        referer: REFERER_DATA_ODDS[gameType],
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest',
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      body: payload.toString()
    })

    if (!res.ok) {
      throw new Error(`Request failed ${res.status}`)
    }

    const data = (await res.json()) as DataOddsResponse

    const dataOdds = [GAME_TYPES.EARLY, GAME_TYPES.TODAY].includes(gameType)
      ? ((data as DataOddsEarly).today ?? [])
      : ((data as DataOddsNormal).data ?? [])

    handleData({ dataOdds, account })
  } catch (error) {
    console.error(
      'Error Crawl Data 3in1Bet:',
      error instanceof Error ? error.message : String(error)
    )

    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Error Crawl Data 3in1Bet And LoggedAgain: ${error instanceof Error ? error.message : 'Fetch DATA_ODDS error.'}`,
      'Program'
    )
    isAccountActive(account.id) &&
      Account.update(
        { id: account.id },
        {
          statusLogin: STATUS_LOGIN.FAIL,
          textLog: 'Logged Again ...',
          credit: '0',
          cookie: null,
          host: null,
          socketUrl: null
        }
      ) &&
      port.postMessage({
        type: 'LoggedAgain',
        idAccount: account.id
      })
  }
}

const handleData = async ({ dataOdds, account }) => {
  clearTable('IIIin1Bet')
  if (!gameType || gameType === GAME_TYPES.NONE) return
  const IIIin1Bet = createModel('IIIin1Bet', dataCrawlByPlatformSchema)
  const League_3in1Bet = createModel('League_3in1Bet', rootLeagueSchema)

  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Get Soccer ${gameType}...`,
    'Program'
  )

  if (isAccountActive(account.id)) {
    Account.updateMany(
      {
        status: STATUS_ACCOUNT.LOGOUT,
        statusLogin: STATUS_LOGIN.SUCCESS,
        platformName: PLATFORM['3IN1BET'],
        statusDelete: 0
      },
      {
        textLog: `Get Soccer ${gameType}...`
      }
    )
    port.postMessage({ type: 'LogHandleData3in1bet' })
  } else return
  await setTimeout(1000)

  if (dataOdds.length === 0) {
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Soccer ${gameType}: No data.`,
      'Program'
    )
    if (isAccountActive(account.id)) {
      Account.updateMany(
        {
          status: STATUS_ACCOUNT.LOGOUT,
          statusDelete: 0,
          statusLogin: STATUS_LOGIN.SUCCESS,
          platformName: PLATFORM['3IN1BET']
        },
        {
          textLog: `Soccer ${gameType}: No data.`
        }
      )
      port.postMessage({ type: 'LogHandleData3in1bet' })
    }
    return
  }

  let eventsLength = 0
  const timeStart = new Date().getTime()

  for (const dataOdd of dataOdds) {
    eventsLength += dataOdds.length

    if (dataOdd[4] !== 'Soccer') continue

    // Giải đấu
    const idLeague = dataOdd[3]
    const uuidLeague = dataOdd[34]
    const nameLeague = dataOdd[37].trim()

    if (nameLeague.includes(' - ')) continue

    // Trận đấu
    const idEvent = dataOdd[0]
    const nameHome = dataOdd[38].trim() || 'Unknown Home Team'
    const nameAway = dataOdd[39].trim() || 'Unknown Away Team'

    if (dataOdd[37]?.includes(' - ')) continue

    const league_3in1Bet = League_3in1Bet.findOne({ nameLeague }) as LeagueType
    if (!league_3in1Bet) {
      const newLeague: Partial<LeagueType> = {
        idLeague,
        nameLeague
      }

      if (import.meta.env.VITE_KEY_ENABLE == '1') {
        newLeague.league = nameLeague.toUpperCase()
      }

      League_3in1Bet.create(newLeague)
      continue
    }
    if (league_3in1Bet && !league_3in1Bet.league) continue

    // index check đội nào mạnh
    const indexCheck = dataOdd[24]

    // Cấu hình các loại kèo
    const configs = [
      {
        number: 0,
        score: GAME_TYPES.RUNNING == gameType && `${dataOdd[7]} - ${dataOdd[8]}`,
        stat: GAME_TYPES.RUNNING == gameType && dataOdd[53],
        hdp_point: indexCheck === 0 ? dataOdd[10] : dataOdd[10] * -1,
        home_over: dataOdd[40],
        away_under: dataOdd[41],
        type: TYPE_ODD.HDP,
        typeOdd: TYPE_ODD_DETAIL.HDP,
        HDP: CONVERT_HDP[dataOdd[10]]
      },
      {
        number: 0,
        score: GAME_TYPES.RUNNING == gameType && `${dataOdd[7]} - ${dataOdd[8]}`,
        stat: GAME_TYPES.RUNNING == gameType && dataOdd[53],
        hdp_point: dataOdd[12],
        home_over: dataOdd[42],
        away_under: dataOdd[43],
        type: TYPE_ODD.OU,
        typeOdd: TYPE_ODD_DETAIL.OU,
        HDP: CONVERT_HDP[dataOdd[12]]
      },
      {
        number: 1,
        score: GAME_TYPES.RUNNING == gameType && `${dataOdd[7]} - ${dataOdd[8]}`,
        stat: GAME_TYPES.RUNNING == gameType && dataOdd[53],
        hdp_point: indexCheck === 0 ? dataOdd[14] : dataOdd[14] * -1,
        home_over: dataOdd[44],
        away_under: dataOdd[45],
        type: TYPE_ODD.HDP,
        typeOdd: TYPE_ODD_DETAIL.HDP,
        HDP: CONVERT_HDP[dataOdd[14]]
      },
      {
        number: 1,
        score: GAME_TYPES.RUNNING == gameType && `${dataOdd[7]} - ${dataOdd[8]}`,
        stat: GAME_TYPES.RUNNING == gameType && dataOdd[53],
        hdp_point: dataOdd[16],
        home_over: dataOdd[46],
        away_under: dataOdd[47],
        type: TYPE_ODD.OU,
        typeOdd: TYPE_ODD_DETAIL.OU,
        HDP: CONVERT_HDP[dataOdd[16]]
      }
    ]

    // Lọc bỏ config có chứa -999
    const validConfigs = configs.filter((cfg) => {
      return cfg.hdp_point !== -999 && cfg.home_over !== -999 && cfg.away_under !== -999
    })

    // Map ra dữ liệu insert
    const records = validConfigs.map((cfg) => ({
      platform: PLATFORM['3IN1BET'],
      idLeague,
      uuidLeague,
      nameLeague,
      idEvent,
      isHomeStrong: indexCheck,
      nameHome,
      nameAway,
      league: league_3in1Bet.league,
      home: nameHome.toUpperCase(),
      away: nameAway.toUpperCase(),
      score: cfg?.score || null,
      stat: cfg?.stat || null,
      number: cfg.number,
      hdp_point: cfg.hdp_point,
      home_over: cfg.home_over,
      away_under: cfg.away_under,
      type: cfg.type,
      typeOdd: cfg.typeOdd,
      HDP: cfg.HDP
    }))

    if (records.length !== 0) {
      IIIin1Bet.insertMany(records)
    }
  }

  const timeEnd = new Date().getTime()
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Handle Data Odds Done All. (${eventsLength}, ${timeEnd - timeStart}ms)`,
    'Program'
  )
  if (isAccountActive(account.id)) {
    Account.updateMany(
      {
        status: STATUS_ACCOUNT.LOGOUT,
        statusDelete: 0,
        statusLogin: STATUS_LOGIN.SUCCESS,
        platformName: PLATFORM['3IN1BET']
      },
      {
        textLog: `Handle Data Odds Done All. (${eventsLength}, ${timeEnd - timeStart}ms)`
      }
    )
    port.postMessage({ type: 'LogHandleData3in1bet' })
  } else return
}
