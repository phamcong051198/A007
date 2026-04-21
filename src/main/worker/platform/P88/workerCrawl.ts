/* eslint-disable @typescript-eslint/no-explicit-any */
import { setTimeout } from 'timers/promises'
import { parentPort } from 'worker_threads'

import { Account, clearTable, createModel, Setting } from '@db/model'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import rootLeagueSchema from '@db/schema/rootLeague'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { FH, FT, HDP_FH, HDP_FT, OU_FH, OU_FT, SPREAD, TOTAL } from '@shared/common/constants'
import { CONVERT_HDP } from '@shared/common/constants'
import { AccountType, LeagueType, SettingType } from '@shared/common/types'
import { PLATFORM, STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isAccountActive } from '@/worker/lib/checkAccount'
import { checkGameType } from '@/worker/lib/checkGameType'
import { insertRecords } from '@/worker/lib/insertRecords'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { logTime } from '@/worker/lib/logTime'
import { systemLogToFile } from '@/worker/lib/systemLogToFile'
import { toPositiveNumber } from '@/worker/lib/toPositiveNumber'
import { getBalanceP88bet } from '@/worker/platform/P88/actions/getBalance'
import { buildHeadersP88Bet, gameTypeMapP88 } from '@/worker/platform/P88/common/contants'
import { buildPlatformUrl } from '@/worker/platform/P88/helper'

let gameType: string | null = null

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async (action: string) => {
  if (action == 'Start') {
    try {
      await handleCrawlData()
    } catch (error) {
      await systemLogToFile(`Error Handle Crawl Data P88Bet: ${JSON.stringify(error)}`, 'Error')
    }
  }
})

const handleCrawlData = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const listAccount = Account.findAll({
      platformName: 'P88Bet',
      status: 'Logout',
      statusDelete: 0,
      statusLogin: 'Success'
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
  if (!gameType || gameType === 'None') return

  const accountRefresh = Account.findOne({
    id: account.id,
    status: 'Logout',
    statusDelete: 0,
    statusLogin: 'Success'
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
          status: 'Exit',
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
    status && account.proxyScope !== 'None'
      ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
      : undefined

  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  const { ErrorCode, Data } = await getBalanceP88bet(account)

  if (ErrorCode == 106 || ErrorCode == 107 || ErrorCode == -1 || ErrorCode == -2) {
    await accountLogToFile(account.platformName, account.loginID, `${Data}`, 'Program')

    if (ErrorCode == -2) {
      isAccountActive(account.id) &&
        Account.update(
          { id: account.id },
          {
            status: 'Exit',
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
      status: 'Logout',
      statusDelete: 0,
      statusLogin: 'Success'
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
            statusLogin: 'Fail',
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
            status: 'Exit',
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
    const resKeepAlive = await fetch(buildPlatformUrl(account, 'KEEP_ALIVE'), {
      method: 'GET',
      headers: {
        ...buildHeadersP88Bet(account),
        Cookie: account.cookie
      },
      ...(proxyAgent && { agent: proxyAgent })
    })

    const vHucode = resKeepAlive.headers.get('v-hucode')

    if (!vHucode) {
      throw new Error('V-hucode not found')
    }

    const mk: number = gameTypeMapP88[gameType] //(0-Early;1-Today;2-Live)

    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Get Soccer ${gameType}...`,
      'Program'
    )
    if (isAccountActive(account.id)) {
      Account.updateMany(
        {
          platformName: PLATFORM.P88BET,
          status: STATUS_ACCOUNT.LOGOUT,
          statusDelete: 0,
          statusLogin: STATUS_LOGIN.SUCCESS
        },
        {
          textLog: `Get Soccer ${gameType}...`
        }
      )
      port.postMessage({ type: 'LogHandleDataP88' })
    } else return

    const url = `${account.loginURL}sports-service/sv/odds/events?mk=${mk}&sp=29&ot=4&btg=1&o=1&lg=&ev=&d=&l=100&v=0&me=0&more=false&c=MY&tm=0&g=QQ%3D%3D&pa=0&cl=100&_g=0&wm=dz&_=${Date.now()}&locale=en_US`
    const res = await fetch(url, {
      headers: {
        ...buildHeadersP88Bet(account, vHucode),
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

    let dataP88: any
    if (mk === 0 || mk === 1) {
      dataP88 = resData.n[0][2]
    } else if (mk === 2) {
      dataP88 = resData.l[0][2]
    }

    if (!dataP88.length) {
      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Soccer ${gameType}: No data.`,
        'Program'
      )
      if (isAccountActive(account.id)) {
        Account.updateMany(
          {
            platformName: PLATFORM.P88BET,
            status: STATUS_ACCOUNT.LOGOUT,
            statusDelete: 0,
            statusLogin: STATUS_LOGIN.SUCCESS
          },
          {
            textLog: `Soccer ${gameType}: No data.`
          }
        )
        port.postMessage({ type: 'LogHandleDataP88' })
      }
      return
    }

    await handleData({ account, dataP88 })
  } catch (error) {
    console.error(
      'Error Crawl Data P88Bet:',
      error instanceof Error ? error.message : String(error)
    )
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Error Crawl Data P88Bet And LoggedAgain: ${error instanceof Error ? error.message : 'Unstable network, proxy or server-side issue.'}`,
      'Program'
    )
    isAccountActive(account.id) &&
      Account.update(
        { id: account.id },
        {
          status: 'Exit',
          textLog: 'Invalid json response body.'
        }
      ) &&
      port.postMessage({
        idAccount: account.id,
        type: 'DataUpdateAccount'
      })

    clearTable('P88Bet')
    return
  }
}

const handleData = async ({ dataP88, account }) => {
  clearTable('P88Bet')

  if (!gameType || gameType === 'None') return
  const P88Bet = createModel('P88Bet', dataCrawlByPlatformSchema)
  const League_P88Bet = createModel('League_P88Bet', rootLeagueSchema)

  const timeStart = new Date().getTime()
  const records: any[] = []
  const eventsLength = dataP88.length

  for (const league of dataP88) {
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
      if (!league_P88Bet) {
        const newLeague: Partial<LeagueType> = {
          idLeague: id,
          nameLeague: name.trim()
        }

        League_P88Bet.create(newLeague)
        continue
      }

      if (league_P88Bet && !league_P88Bet.league) continue

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
              league: league_P88Bet.league,
              nameAway: away,
              nameHome: home,
              nameLeague: name,
              number: FT,
              platform: 'P88Bet',
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              specialOdd: periodFull[8],
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'HDP',
              typeOdd: SPREAD
            })

            insertRecords(records, P88Bet)
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
              league: league_P88Bet.league,
              nameAway: away,
              nameHome: home,
              nameLeague: name,
              number: FT,
              platform: 'P88Bet',
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              specialOdd: totalFull[5],
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'OU',
              typeOdd: TOTAL
            })

            insertRecords(records, P88Bet)
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
              league: league_P88Bet.league,
              nameAway: away,
              nameHome: home,
              nameLeague: name,
              number: FH,
              platform: 'P88Bet',
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              specialOdd: periodHalf[8],
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'HDP',
              typeOdd: SPREAD
            })

            insertRecords(records, P88Bet)
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
              league: league_P88Bet.league,
              nameAway: away,
              nameHome: home,
              nameLeague: name,
              number: FH,
              platform: 'P88Bet',
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              specialOdd: totalHalf[5],
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'OU',
              typeOdd: TOTAL
            })

            insertRecords(records, P88Bet)
          }
        }
      }

      if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return
    }
  }

  if (records.length > 0) {
    insertRecords(records, P88Bet)
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
        platformName: PLATFORM.P88BET,
        status: STATUS_ACCOUNT.LOGOUT,
        statusDelete: 0,
        statusLogin: STATUS_LOGIN.SUCCESS
      },
      {
        textLog: `Handle Data Event Done All. (${eventsLength}, ${timeEnd - timeStart}ms)`
      }
    )
    port.postMessage({ type: 'LogHandleDataP88' })
  } else return
}
