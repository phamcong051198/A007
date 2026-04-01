/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { setTimeout } from 'timers/promises'
import { parentPort } from 'worker_threads'

import { Account, clearTable, createModel, Setting } from '@db/model'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import rootLeagueSchema from '@db/schema/rootLeague'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import {
  FH,
  FT,
  GAME_TYPES,
  HDP_FH,
  HDP_FT,
  OU_FH,
  OU_FT,
  SPREAD,
  TOTAL
} from '@shared/common/constants'
import { CONVERT_HDP } from '@shared/common/constants'
import { AccountType, LeagueType, SettingType } from '@shared/common/types'
import { OPTIONS_PROXY, STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isAccountActive } from '@/worker/lib/checkAccount'
import { checkGameType } from '@/worker/lib/checkGameType'
import { insertRecords } from '@/worker/lib/insertRecords'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { logTime } from '@/worker/lib/logTime'
import { systemLogToFile } from '@/worker/lib/systemLogToFile'
import { toPositiveNumber } from '@/worker/lib/toPositiveNumber'
import { PLATFORM } from '@/worker/platform/platform.config'
import { getBalancePs3838 } from '@/worker/platform/Ps3838/actions/getBalance'
import { buildHeadersPs3838, gameTypeMapPs3838 } from '@/worker/platform/Ps3838/common/contants'

let gameType: string | null = null

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async (action: string) => {
  if (action == 'Start') {
    try {
      await handleCrawlData()
    } catch (error) {
      await systemLogToFile(`Error Handle Crawl Data Ps3838: ${JSON.stringify(error)}`, 'Error')
    }
  }
})

const handleCrawlData = async () => {
  while (true) {
    const listAccount = Account.findAll({
      platformName: PLATFORM.PS3838,
      status: STATUS_ACCOUNT.LOGOUT,
      statusDelete: 0,
      statusLogin: STATUS_LOGIN.SUCCESS
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

  const accountRefresh = Account.findOne({
    id: account.id,
    status: STATUS_ACCOUNT.LOGOUT,
    statusDelete: 0,
    statusLogin: STATUS_LOGIN.SUCCESS
  }) as AccountType
  if (!accountRefresh) return

  if (accountRefresh.typeCrawl !== gameType) {
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
        idAccount: account.id,
        type: 'DataUpdateAccount'
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

  const { ErrorCode, Data } = await getBalancePs3838(account)

  if (ErrorCode == 106 || ErrorCode == 107 || ErrorCode == -1 || ErrorCode == -2) {
    await accountLogToFile(account.platformName, account.loginID, `${Data}`, 'Program')

    if (ErrorCode == -2) {
      isAccountActive(account.id) &&
        Account.update(
          { id: account.id },
          {
            status: STATUS_ACCOUNT.EXIT,
            textLog: Data
          }
        ) &&
        port.postMessage({
          idAccount: account.id,
          type: 'DataUpdateAccount'
        })
      return
    }

    const dataAccount = Account.findOne({
      id: account.id,
      status: STATUS_ACCOUNT.LOGOUT,
      statusDelete: 0,
      statusLogin: STATUS_LOGIN.SUCCESS
    }) as AccountType
    if (!dataAccount) return

    if (dataAccount.checkBoxAutoLogin == 1) {
      isAccountActive(account.id) &&
        Account.update(
          { id: account.id },
          {
            cookie: null,
            credit: '0',
            host: null,
            socketUrl: null,
            statusLogin: STATUS_LOGIN.FAIL,
            textLog: 'Logged Again ...'
          }
        ) &&
        port.postMessage({
          idAccount: account.id,
          type: 'LoggedAgain'
        })
    } else {
      isAccountActive(account.id) &&
        Account.update(
          { id: account.id },
          {
            status: STATUS_ACCOUNT.EXIT,
            textLog: Data
          }
        ) &&
        port.postMessage({
          idAccount: account.id,
          type: 'DataUpdateAccount'
        })
    }

    return
  }

  isAccountActive(account.id) &&
    Account.update({ id: account.id }, { credit: Data }) &&
    port.postMessage({
      idAccount: account.id,
      type: 'DataUpdateAccount'
    })

  try {
    const mk: number = gameTypeMapPs3838[gameType] //(0-Early;1-Today;2-Live)

    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Get Soccer ${gameType}...`,
      'Program'
    )
    if (isAccountActive(account.id)) {
      Account.updateMany(
        {
          platformName: PLATFORM.PS3838,
          status: STATUS_ACCOUNT.LOGOUT,
          statusDelete: 0,
          statusLogin: STATUS_LOGIN.SUCCESS
        },
        {
          textLog: `Get Soccer ${gameType}...`
        }
      )
      port.postMessage({ type: 'LogHandleDataPs3838' })
    } else return

    const url = `${account.loginURL}sports-service/sv/odds/events?mk=${mk}&sp=29&ot=4&btg=1&o=1&lg=&ev=&d=&l=100&v=0&me=0&more=false&c=MY&tm=0&g=QQ%3D%3D&pa=0&cl=100&_g=0&wm=dz&_=${Date.now()}&locale=en_US`
    const res = await fetch(url, {
      headers: {
        ...buildHeadersPs3838(account),
        Cookie: account.cookie
      },
      method: 'GET',
      ...(proxyAgent && { agent: proxyAgent })
    })

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      const text = await res.text()
      console.error(`${logTime()}Response is not JSON:`, text)
      throw new Error('Received non-JSON response')
    }

    const resData = await res.json()

    let dataPs3838: any
    if (mk === 0 || mk === 1) {
      dataPs3838 = resData.n[0][2]
    } else if (mk === 2) {
      dataPs3838 = resData.l[0][2]
    }

    if (!dataPs3838.length) {
      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Soccer ${gameType}: No data.`,
        'Program'
      )
      if (isAccountActive(account.id)) {
        Account.updateMany(
          {
            platformName: PLATFORM.PS3838,
            status: STATUS_ACCOUNT.LOGOUT,
            statusDelete: 0,
            statusLogin: STATUS_LOGIN.SUCCESS
          },
          {
            textLog: `Soccer ${gameType}: No data.`
          }
        )
        port.postMessage({ type: 'LogHandleDataPs3838' })
      }
      clearTable(PLATFORM.PS3838)
      return
    }

    await handleData({ account, dataPs3838 })
  } catch (error) {
    console.error(
      'Error Crawl Data Ps3838:',
      error instanceof Error ? error.message : String(error)
    )
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Error Crawl Data Ps3838 And LoggedAgain: ${error instanceof Error ? error.message : 'Unstable network, proxy or server-side issue.'}`,
      'Program'
    )
    isAccountActive(account.id) &&
      Account.update(
        { id: account.id },
        {
          status: STATUS_ACCOUNT.EXIT,
          textLog: 'Invalid json response body.'
        }
      ) &&
      port.postMessage({
        idAccount: account.id,
        type: 'DataUpdateAccount'
      })

    clearTable(PLATFORM.PS3838)
    return
  }
}

const handleData = async ({ dataPs3838, account }) => {
  clearTable(PLATFORM.PS3838)

  if (!gameType || gameType === GAME_TYPES.NONE) return
  const Ps3838 = createModel(PLATFORM.PS3838, dataCrawlByPlatformSchema)
  const League_P88Bet = createModel('League_P88Bet', rootLeagueSchema)
  const League_Ps3838 = createModel('League_Ps3838', rootLeagueSchema)

  const timeStart = new Date().getTime()
  const records: any[] = []
  const eventsLength = dataPs3838.length

  for (const league of dataPs3838) {
    if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return

    const [id, name, events] = league

    if (name.toLowerCase().includes('corners')) continue
    if (name.toLowerCase().includes('bookings')) continue

    for (const event of events) {
      if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return

      const idEvent = event[0]
      const home = event[1].trim()
      const away = event[2].trim()

      const league_P88Bet = League_P88Bet.findOne({ nameLeague: name.trim() }) as LeagueType

      const league_Ps3838 = League_Ps3838.findOne({ nameLeague: name.trim() }) as LeagueType

      if (league_P88Bet && league_P88Bet.league && league_Ps3838 && !league_Ps3838.league) {
        League_Ps3838.update({ id: league_Ps3838.id }, { league: league_P88Bet.league })
        continue
      }

      if (!league_Ps3838) {
        const newLeague: Partial<LeagueType> = {
          idLeague: id,
          nameLeague: name.trim()
        }

        League_Ps3838.create(newLeague)
        continue
      }

      if (league_Ps3838 && !league_Ps3838.league) continue

      const hasValidData = event[9] && event[10] && event[16]

      if (event && event[8] && event[8]['0'] && event[8]['0'][0]) {
        if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return

        const periodsFull = event[8]['0'][0]
        if (periodsFull && periodsFull.length > 0) {
          for (const periodFull of periodsFull) {
            if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType))
              return
            if (+periodFull[3] == 0 || +periodFull[4] == 0) continue

            records.push({
              HDP: CONVERT_HDP[toPositiveNumber(periodFull[1])],
              altLineId: periodFull[7],
              away: away.toUpperCase(),
              away_under: +periodFull[4],
              betType: HDP_FT,
              hdp_point: periodFull[1],
              home: home.toUpperCase(),
              home_over: +periodFull[3],
              idEvent,
              idLeague: id,
              league: league_Ps3838.league,
              nameAway: away,
              nameHome: home,
              nameLeague: name,
              number: FT,
              platform: PLATFORM.PS3838,
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              specialOdd: periodFull[8],
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'HDP',
              typeOdd: SPREAD
            })

            insertRecords(records, Ps3838)
          }
        }
      }
      if (event && event[8] && event[8]['0'] && event[8]['0'][1]) {
        if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return

        const totalsFull = event[8]['0'][1]
        if (totalsFull && totalsFull.length > 0) {
          for (const totalFull of totalsFull) {
            if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType))
              return
            if (+totalFull[2] == 0 || +totalFull[3] == 0) continue

            records.push({
              HDP: CONVERT_HDP[toPositiveNumber(totalFull[1])],
              altLineId: totalFull[4],
              away: away.toUpperCase(),
              away_under: +totalFull[3],
              betType: OU_FT,
              hdp_point: totalFull[1],
              home: home.toUpperCase(),
              home_over: +totalFull[2],
              idEvent,
              idLeague: id,
              league: league_Ps3838.league,
              nameAway: away,
              nameHome: home,
              nameLeague: name,
              number: FT,
              platform: PLATFORM.PS3838,
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              specialOdd: totalFull[5],
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'OU',
              typeOdd: TOTAL
            })

            insertRecords(records, Ps3838)
          }
        }
      }
      if (event && event[8] && event[8]['1'] && event[8]['1'][0]) {
        if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return

        const periodsHalf = event[8]['1'][0]
        if (periodsHalf && periodsHalf.length > 0) {
          for (const periodHalf of periodsHalf) {
            if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType))
              return

            records.push({
              HDP: CONVERT_HDP[toPositiveNumber(periodHalf[1])],
              altLineId: periodHalf[7],
              away: away.toUpperCase(),
              away_under: +periodHalf[4],
              betType: HDP_FH,
              hdp_point: periodHalf[1],
              home: home.toUpperCase(),
              home_over: +periodHalf[3],
              idEvent,
              idLeague: id,
              league: league_Ps3838.league,
              nameAway: away,
              nameHome: home,
              nameLeague: name,
              number: FH,
              platform: PLATFORM.PS3838,
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              specialOdd: periodHalf[8],
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'HDP',
              typeOdd: SPREAD
            })

            insertRecords(records, Ps3838)
          }
        }
      }
      if (event && event[8] && event[8]['1'] && event[8]['1'][1]) {
        if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return

        const totalsHalf = event[8]['1'][1]
        if (totalsHalf && totalsHalf.length > 0) {
          for (const totalHalf of totalsHalf) {
            if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType))
              return

            records.push({
              HDP: CONVERT_HDP[toPositiveNumber(totalHalf[1])],
              altLineId: totalHalf[4],
              away: away.toUpperCase(),
              away_under: +totalHalf[3],
              betType: OU_FH,
              hdp_point: totalHalf[1],
              home: home.toUpperCase(),
              home_over: +totalHalf[2],
              idEvent,
              idLeague: id,
              league: league_Ps3838.league,
              nameAway: away,
              nameHome: home,
              nameLeague: name,
              number: FH,
              platform: PLATFORM.PS3838,
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              specialOdd: totalHalf[5],
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'OU',
              typeOdd: TOTAL
            })

            insertRecords(records, Ps3838)
          }
        }
      }

      if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return
    }
  }

  if (records.length > 0) {
    insertRecords(records, Ps3838)
  }

  if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return

  const timeEnd = new Date().getTime()
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Handle Data Event Done All. (${eventsLength}, ${timeEnd - timeStart}ms)`,
    'Program'
  )

  if (isAccountActive(account.id)) {
    Account.updateMany(
      {
        platformName: PLATFORM.PS3838,
        status: STATUS_ACCOUNT.LOGOUT,
        statusDelete: 0,
        statusLogin: STATUS_LOGIN.SUCCESS
      },
      {
        textLog: `Handle Data Event Done All. (${eventsLength}, ${timeEnd - timeStart}ms)`
      }
    )
    port.postMessage({ type: 'LogHandleDataPs3838' })
  } else return
}
