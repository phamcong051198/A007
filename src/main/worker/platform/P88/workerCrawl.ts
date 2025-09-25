/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from 'node-fetch'
import { parentPort } from 'worker_threads'
import { setTimeout } from 'timers/promises'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { FH, FT, HDP_FH, HDP_FT, OU_FH, OU_FT, SPREAD, TOTAL } from '@shared/common/constants'
import { AccountType, NameTeamType, SettingType } from '@shared/common/types'
import { Account, clearTable, createModel, NameTeam, Setting } from '@db/model'
import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { toPositiveNumber } from '@/worker/lib/toPositiveNumber'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { getBalanceP88bet } from '@/worker/platform/P88/actions/getBalance'
import { isAccountActive } from '@/worker/lib/checkAccount'
import { logTime } from '@/worker/lib/logTime'
import { CONVERT_HDP } from '@shared/common/constants'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { checkGameType } from '@/worker/lib/checkGameType'
import { insertRecords } from '@/worker/lib/insertRecords'
import { systemLogToFile } from '@/worker/lib/systemLogToFile'
import { buildHeadersP88Bet, gameTypeMapP88 } from '@/worker/platform/P88/common/contants'
import { PLATFORM, STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

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
      statusLogin: 'Success',
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
  if (!gameType || gameType === 'None') return

  const accountRefresh = Account.findOne({
    id: account.id,
    statusDelete: 0,
    status: 'Logout',
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
        type: 'DataUpdateAccount',
        idAccount: account.id
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
          type: 'DataUpdateAccount',
          idAccount: account.id
        })
      return
    }

    const dataAccount = Account.findOne({
      id: account.id,
      status: 'Logout',
      statusLogin: 'Success',
      statusDelete: 0
    }) as AccountType
    if (!dataAccount) return

    if (dataAccount.checkBoxAutoLogin == 1) {
      isAccountActive(account.id) &&
        Account.update(
          { id: account.id },
          {
            statusLogin: 'Fail',
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
            status: 'Exit',
            textLog: Data
          }
        ) &&
        port.postMessage({
          type: 'DataUpdateAccount',
          idAccount: account.id
        })
    }

    return
  }

  isAccountActive(account.id) &&
    Account.update({ id: account.id }, { credit: Data }) &&
    port.postMessage({
      type: 'DataUpdateAccount',
      idAccount: account.id
    })

  try {
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
          status: STATUS_ACCOUNT.LOGOUT,
          statusLogin: STATUS_LOGIN.SUCCESS,
          platformName: PLATFORM.P88BET,
          statusDelete: 0
        },
        {
          textLog: `Get Soccer ${gameType}...`
        }
      )
      port.postMessage({ type: 'LogHandleDataP88' })
    } else return

    const url = `https://www.p88.bet/sports-service/sv/odds/events?mk=${mk}&sp=29&ot=4&btg=1&o=1&lg=&ev=&d=&l=100&v=0&me=0&more=false&c=MY&tm=0&g=QQ%3D%3D&pa=0&cl=100&_g=0&wm=dz&_=${Date.now()}&locale=en_US`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...buildHeadersP88Bet(account),
        Cookie: account.cookie
      },
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
            status: STATUS_ACCOUNT.LOGOUT,
            statusLogin: STATUS_LOGIN.SUCCESS,
            platformName: PLATFORM.P88BET,
            statusDelete: 0
          },
          {
            textLog: `Soccer ${gameType}: No data.`
          }
        )
        port.postMessage({ type: 'LogHandleDataP88' })
      }
      return
    }

    await handleData({ dataP88, account })
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
        type: 'DataUpdateAccount',
        idAccount: account.id
      })

    clearTable('P88Bet')
    return
  }
}

const handleData = async ({ dataP88, account }) => {
  clearTable('P88Bet')

  if (!gameType || gameType === 'None') return
  const P88Bet = createModel('P88Bet', dataCrawlByPlatformSchema)

  const timeStart = new Date().getTime()
  const records: any[] = []
  const eventsLength = dataP88.length

  for (const league of dataP88) {
    if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return

    const [id, name, events] = league

    const hasCorners = name.toLowerCase().includes('corners')
    if (hasCorners) continue

    for (const event of events) {
      if (!isAccountActive(account.id) || !checkGameType(account.platformName, gameType)) return

      const idEvent = event[0]
      const home = event[1]
      const away = event[2]

      const formatName = (str: string) => str.trim()

      const formatLeague = (str: string) => str.trim()

      const standardHomeName = NameTeam.findOne({
        nameTeam: formatName(home),
        nameLeague: formatLeague(name),
        platform: 'P88Bet'
      }) as NameTeamType
      if (!standardHomeName || !standardHomeName.team || !standardHomeName.league) continue

      const standardAwayName = NameTeam.findOne({
        nameTeam: formatName(away),
        nameLeague: formatLeague(name),
        platform: 'P88Bet'
      }) as NameTeamType

      if (!standardAwayName || !standardAwayName.team || !standardAwayName.league) continue

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
              platform: 'P88Bet',
              idLeague: id,
              nameLeague: name,
              idEvent,
              nameHome: home.trim(),
              nameAway: away.trim(),
              number: FT,
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'HDP',
              altLineId: periodFull[7],
              hdp_point: periodFull[1],
              home_over: +periodFull[3],
              away_under: +periodFull[4],
              typeOdd: SPREAD,
              league: standardHomeName.league,
              home: standardHomeName.team,
              away: standardAwayName.team,
              specialOdd: periodFull[8],
              betType: HDP_FT,
              HDP: CONVERT_HDP[toPositiveNumber(periodFull[1])]
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
              platform: 'P88Bet',
              idLeague: id,
              nameLeague: name,
              idEvent,
              nameHome: home.trim(),
              nameAway: away.trim(),
              number: FT,
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'OU',
              altLineId: totalFull[4],
              hdp_point: totalFull[1],
              home_over: +totalFull[2],
              away_under: +totalFull[3],
              typeOdd: TOTAL,
              league: standardHomeName.league,
              home: standardHomeName.team,
              away: standardAwayName.team,
              specialOdd: totalFull[5],
              betType: OU_FT,
              HDP: CONVERT_HDP[toPositiveNumber(totalFull[1])]
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
              platform: 'P88Bet',
              idLeague: id,
              nameLeague: name,
              idEvent,
              nameHome: home.trim(),
              nameAway: away.trim(),
              number: FH,
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'HDP',
              altLineId: periodHalf[7],
              hdp_point: periodHalf[1],
              home_over: +periodHalf[3],
              away_under: +periodHalf[4],
              typeOdd: SPREAD,
              league: standardHomeName.league,
              home: standardHomeName.team,
              away: standardAwayName.team,
              specialOdd: periodHalf[8],
              betType: HDP_FH,
              HDP: CONVERT_HDP[toPositiveNumber(periodHalf[1])]
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
              platform: 'P88Bet',
              idLeague: id,
              nameLeague: name,
              idEvent,
              nameHome: home.trim(),
              nameAway: away.trim(),
              number: FH,
              score: hasValidData ? `${event[9][0]}-${event[9][1]}` : '',
              redCard: hasValidData ? `${event[10][0]}-${event[10][1]}` : '',
              stat: hasValidData ? `${event[16] || ''} ${event[15] || ''}`.trim() : '',
              type: 'OU',
              altLineId: totalHalf[4],
              hdp_point: totalHalf[1],
              home_over: +totalHalf[2],
              away_under: +totalHalf[3],
              typeOdd: TOTAL,
              league: standardHomeName.league,
              home: standardHomeName.team,
              away: standardAwayName.team,
              specialOdd: totalHalf[5],
              betType: OU_FH,
              HDP: CONVERT_HDP[toPositiveNumber(totalHalf[1])]
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
        status: STATUS_ACCOUNT.LOGOUT,
        statusLogin: STATUS_LOGIN.SUCCESS,
        platformName: PLATFORM.P88BET,
        statusDelete: 0
      },
      {
        textLog: `Handle Data Event Done All. (${eventsLength}, ${timeEnd - timeStart}ms)`
      }
    )
    port.postMessage({ type: 'LogHandleDataP88' })
  } else return
}
