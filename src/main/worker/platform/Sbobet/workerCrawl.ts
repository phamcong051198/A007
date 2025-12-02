/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { setTimeout } from 'timers/promises'
import { parentPort } from 'worker_threads'

import Model, { Account, clearTable, createModel, EventSbobet, Setting } from '@db/model'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { EventSbobetType } from '@db/schema/eventSbobet'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { CONVERT_HDP, SPREAD, TOTAL } from '@shared/common/constants'
import { AccountType, DataCrawlType, SettingType } from '@shared/common/types'

import { getBalanceSbobet } from './actions/getBalance'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isAccountActive } from '@/worker/lib/checkAccount'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { systemLogToFile } from '@/worker/lib/systemLogToFile'
import { toPositiveNumber } from '@/worker/lib/toPositiveNumber'
import { SBO_CONFIG, SBO_CONFIG_TYPE_ODD } from '@/worker/platform/Sbobet/common/constants'

let gameType: string | null = null

interface Account {
  host: string
  cookie: string
}
const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async (action: string) => {
  if (action == 'Start') {
    try {
      await handleCrawlData()
    } catch (error) {
      await systemLogToFile(`Error Handle Crawl Data Sbobet: ${JSON.stringify(error)}`, 'Error')
    }
  }
})

const handleCrawlData = async () => {
  while (true) {
    const listAccount = Account.findAll({
      platformName: 'Sbobet',
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
  await accountLogToFile(
    account.platformName,
    account.loginID,
    'Data Scraping In Progress...',
    'Program'
  )
  Account.updateMany(
    { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
    {
      textLog: 'Data Scraping In Progress...'
    }
  )
  port.postMessage({ type: 'LogHandleDataSbobet' })

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

  const { ErrorCode, Data } = (await getBalanceSbobet(account)) as any

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
    const timeStart = new Date().getTime()
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Get Soccer ${gameType}...`,
      'Program'
    )
    if (isAccountActive(account.id)) {
      Account.updateMany(
        { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
        {
          textLog: `Get Soccer ${gameType}...`
        }
      )
      port.postMessage({ type: 'LogHandleDataSbobet' })
    } else return

    const extensions = {
      persistedQuery: {
        sha256Hash: SBO_CONFIG.SHA256_HASH,
        version: 1
      }
    }

    const extensionsQuery = {
      persistedQuery: {
        sha256Hash: SBO_CONFIG.SHA256_HASH_QUERY,
        version: 1
      }
    }
    const fetchTokenUrl = `${account.host}${SBO_CONFIG.FETCH_TOKEN}`
    const headersGetToken = {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      Connection: 'keep-alive',
      'Content-Length': '0',
      Cookie: account.cookie,
      Referer: account.host,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
    }

    const resToken = await fetch(fetchTokenUrl, {
      headers: headersGetToken,
      method: 'GET',
      ...(proxyAgent && { agent: proxyAgent })
    })

    const tokenData = await resToken.json()
    const authToken = tokenData.authToken
    const oddsToken = tokenData.oddsToken

    const headers = {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
      authorization: authToken,
      'content-type': 'application/json',
      referer: account.host,
      'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
    }

    const extensionsString = encodeURIComponent(JSON.stringify(extensions))
    const extensionsStringQuery = encodeURIComponent(JSON.stringify(extensionsQuery))
    let DataPreset = {}

    if (gameType === 'Early') {
      DataPreset = { date: 'EarlyMarket', presetFilter: 'NonLive' }
    }

    if (gameType === 'Running') {
      DataPreset = { date: 'All', presetFilter: 'Live' }
    }

    if (gameType === 'Today') {
      DataPreset = { date: 'Today', presetFilter: 'NonLive' }
    }

    const variablesString = encodeURIComponent(
      JSON.stringify({
        query: {
          eventIds: [],
          filter: DataPreset,
          oddsCategory: 'All',
          sport: 'Soccer',
          timeZone: 'UTC__4',
          tournamentIds: [],
          tournamentNames: []
        }
      })
    )
    const fetchTeamUrl = `${new URL(SBO_CONFIG.FETCH_EVENT)}?operationName=EventsQuery&variables=${variablesString}&extensions=${extensionsString}`
    const fetchResultUrl = `${new URL(SBO_CONFIG.FETCH_EVENT)}?operationName=EventResultsQuery&variables=${variablesString}&extensions=${extensionsStringQuery}`

    try {
      const resEventsQuery = await fetch(fetchTeamUrl, {
        headers,
        method: 'GET',
        ...(proxyAgent && { agent: proxyAgent })
      })
      const contentTypeEventsQuery = resEventsQuery.headers.get('content-type')
      if (contentTypeEventsQuery && !contentTypeEventsQuery.includes('application/json')) {
        await accountLogToFile(
          account.platformName,
          account.loginID,
          `${await resEventsQuery.text()}`,
          'Program'
        )
        throw new Error(
          'This IP has been blocked by Cloudflare. Please use a proxy, VPN, or try again later.'
        )
      }

      const resEventResultsQuery = await fetch(fetchResultUrl, {
        headers,
        method: 'GET',
        ...(proxyAgent && { agent: proxyAgent })
      })
      const contentTypeEventResultsQuery = resEventResultsQuery.headers.get('content-type')
      if (
        contentTypeEventResultsQuery &&
        !contentTypeEventResultsQuery.includes('application/json')
      ) {
        await accountLogToFile(
          account.platformName,
          account.loginID,
          `${await resEventResultsQuery.text()}`,
          'Program'
        )
        throw new Error(
          'This IP has been blocked by Cloudflare. Please use a proxy, VPN, or try again later.'
        )
      }

      const dataSbobet = await resEventsQuery.json()
      const dataSbobetEvent = await resEventResultsQuery.json()

      await handleDataLeague({ account, dataSbobet })
      await handleDataSbobetEvent({ account, dataSbobetEvent })
      await handleDataSbobetOdds({ account, authToken, dataSbobetEvent, oddsToken, proxyAgent })

      const settings = Setting.findAll() as SettingType[]
      if (gameType != settings[0].gameType) return

      const timeEnd = new Date().getTime()
      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Handle Data Sbobet Done. (${timeEnd - timeStart}ms)`,
        'Program'
      )

      isAccountActive(account.id) &&
        Account.updateMany(
          { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
          {
            textLog: `Handle Data Sbobet Done. (${timeEnd - timeStart}ms)`
          }
        ) &&
        port.postMessage({ type: 'LogHandleDataSbobet' })
    } catch (error) {
      console.error('❌ Fetch error:', error)

      const errorMessage =
        'Unable to connect to the server. Please check your network connection or try again later.'
      const message = error instanceof Error ? error.message : errorMessage

      await accountLogToFile(account.platformName, account.loginID, `Error: ${message}`, 'Program')

      if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = (error as any).code
        if (code === 'ECONNRESET') {
          if (isAccountActive(account.id)) {
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
            )
            port.postMessage({
              idAccount: account.id,
              type: 'LoggedAgain'
            })
          }
          return
        }
      }

      if (isAccountActive(account.id)) {
        Account.update(
          { id: account.id },
          {
            checkBoxAutoLogin: 0,
            status: 'Exit',
            textLog: message
          }
        )
        port.postMessage({
          idAccount: account.id,
          type: 'DataUpdateAccount'
        })
      }
      return
    }
  } catch (error) {
    console.error(
      'Error Crawl Data Sbobet:',
      error instanceof Error ? error.message : String(error)
    )
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Error Crawl Data Sbobet And LoggedAgain: ${error instanceof Error ? error.message : 'Unstable network, proxy or server-side issue.'}`,
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

    clearTable('Sbobet')
    return
  }
}

const checkGameType = () => {
  const settingInfo = Setting.findAll()
  const currentGameType = settingInfo[0]?.gameType

  if (!currentGameType || gameType !== currentGameType) {
    clearTable('PerMatchLimit')
    clearTable('Sbobet')
    return false
  }

  return true
}

const insertRecords = (records: any, Sbobet: Model) => {
  Sbobet.insertMany(records)
  records.length = 0
}

const handleDataLeague = async ({ dataSbobet, account }) => {
  if (isAccountActive(account.id)) {
    Account.updateMany(
      { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
      {
        textLog: `Start Handle Data League...`
      }
    )
    port.postMessage({ type: 'LogHandleDataSbobet' })
  } else return

  if (dataSbobet.data.events.length === 0) return

  const timeStart = new Date().getTime()
  const eventsLength = dataSbobet.data.events.length

  for (const event of dataSbobet.data.events) {
    const settings = Setting.findAll() as SettingType[]
    if (gameType != settings[0].gameType) return

    if (!isAccountActive(account.id) || !checkGameType()) return

    const tournament = event.tournament
    const tournamentName = tournament.tournamentName[0].value
    if (tournamentName.toLowerCase().includes('e-')) continue
  }

  if (!isAccountActive(account.id) || !checkGameType()) return

  const timeEnd = new Date().getTime()
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Handle Data League Done. (${eventsLength}, ${timeEnd - timeStart}ms)`,
    'Program'
  )

  Account.updateMany(
    { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
    {
      textLog: `Handle Data League Done. (${eventsLength}, ${timeEnd - timeStart}ms)`
    }
  )
  port.postMessage({ type: 'LogHandleDataSbobet' })
}

const handleDataSbobetEvent = async ({ dataSbobetEvent, account }) => {
  if (isAccountActive(account.id)) {
    Account.updateMany(
      { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
      {
        textLog: `Start Handle Data Events...`
      }
    )
    port.postMessage({ type: 'LogHandleDataSbobet' })
  } else return

  if (dataSbobetEvent.data.events.length === 0) return

  const timeStart = new Date().getTime()
  const eventsLength = dataSbobetEvent.data.events.length

  for (const event of dataSbobetEvent.data.events) {
    if (!isAccountActive(account.id) || !checkGameType()) return
    const existingEvent = EventSbobet.findOne({ idEvent: event.id }) as EventSbobetType
    if (existingEvent) {
      const updatedFields: Partial<EventSbobetType> = {}
      const scoreResult = Array.isArray(event?.eventResults)
        ? event?.eventResults.find((result) => result.marketGroup?.id === 0)
        : null

      if (scoreResult) {
        const liveHomeScore = scoreResult.liveHomeScore
        const liveAwayScore = scoreResult.liveAwayScore

        const newHomeRedCards = scoreResult.extraInfo?.homeRedCards ?? 0
        const newAwayRedCards = scoreResult.extraInfo?.awayRedCards ?? 0

        if (existingEvent.livehomescore !== liveHomeScore) {
          updatedFields.livehomescore = liveHomeScore
        }

        if (existingEvent.liveawayscore !== liveAwayScore) {
          updatedFields.liveawayscore = liveAwayScore
        }

        if (existingEvent.awayred !== newAwayRedCards) {
          updatedFields.awayred = newAwayRedCards
        }

        if (existingEvent.homered !== newHomeRedCards) {
          updatedFields.homered = newHomeRedCards
        }

        if (Object.keys(updatedFields).length > 0) {
          EventSbobet.update({ idEvent: event.id }, updatedFields)
        }
      }
    }
  }

  if (!isAccountActive(account.id) || !checkGameType()) return

  const timeEnd = new Date().getTime()
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Handle Data Event Done. (${eventsLength}, ${timeEnd - timeStart}ms)`,
    'Program'
  )

  Account.updateMany(
    { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
    {
      textLog: `Handle Data League Done. (${eventsLength}, ${timeEnd - timeStart}ms)`
    }
  )
  port.postMessage({ type: 'LogHandleDataSbobet' })
}

const handleDataSbobetOdds = async ({
  dataSbobetEvent,
  account,
  oddsToken,
  authToken,
  proxyAgent
}) => {
  if (isAccountActive(account.id)) {
    Account.updateMany(
      { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
      {
        textLog: `Start Handle Data Odds...`
      }
    )
    port.postMessage({ type: 'LogHandleDataSbobet' })
  } else return

  const Sbobet = createModel('Sbobet', dataCrawlByPlatformSchema)
  const BATCH_SIZE: number = 50
  const records: any[] = []

  const extensionsQuery = {
    persistedQuery: {
      sha256Hash: SBO_CONFIG.SHA256_HASH_ODDS,
      version: 1
    }
  }

  const extensionsStringQuery = encodeURIComponent(JSON.stringify(extensionsQuery))
  const timeStart = new Date().getTime()
  let eventsLength = dataSbobetEvent.data.events.length
  for (const event of dataSbobetEvent.data.events) {
    const settings = Setting.findAll() as SettingType[]
    if (gameType != settings[0].gameType) return

    const timeStart = new Date().getTime()
    eventsLength--

    if (!isAccountActive(account.id) || !checkGameType()) return

    const presetFilter = gameType === 'Running' ? 'Live' : 'NonLive'
    const variablesString = encodeURIComponent(
      JSON.stringify({
        query: {
          excludeMarketGroupIds: null,
          filter: presetFilter,
          id: event.id,
          marketGroupIds: SBO_CONFIG.MARKET_GROUP_IDS,
          oddsCategory: 'All',
          oddsToken: oddsToken,
          priceStyle: 'Malay'
        }
      })
    )
    const headers = {
      Cookie: account.cookie,
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
      authorization: authToken,
      'content-type': 'application/json',
      referer: account.host,
      'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
    }
    const fetchResultUrl = `${new URL(SBO_CONFIG.FETCH_EVENT)}?operationName=OddsQuery&variables=${variablesString}&extensions=${extensionsStringQuery}`

    const resOddsQuery = await fetch(fetchResultUrl, {
      headers,
      method: 'GET',
      ...(proxyAgent && { agent: proxyAgent })
    })

    const contentTypeOddsQuery = resOddsQuery.headers.get('content-type')
    if (contentTypeOddsQuery && !contentTypeOddsQuery.includes('application/json')) {
      await accountLogToFile(
        account.platformName,
        account.loginID,
        `${await resOddsQuery.text()}`,
        'Program'
      )
      throw new Error(
        'This IP has been blocked by Cloudflare. Please use a proxy, VPN, or try again later.'
      )
    }
    const dataSbobet = await resOddsQuery.json()

    if (dataSbobet?.errors?.some((e) => e.extensions?.code === 'UNAUTHENTICATED')) {
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
              textLog: 'UNAUTHENTICATED'
            }
          ) &&
          port.postMessage({
            idAccount: account.id,
            type: 'DataUpdateAccount'
          })
      }

      return
    }

    const matchInfo = (await EventSbobet.findOne({
      idEvent: event.id
    })) as any

    if (!matchInfo?.league || !dataSbobet?.data?.eventOdds) continue
    Sbobet.delete({ idEvent: event.id })
    for (const oddsEvent of dataSbobet.data.eventOdds) {
      if (
        !oddsEvent.marketType.includes('Handicap') &&
        !oddsEvent.marketType.includes('OverUnder')
      ) {
        continue
      }

      let checkField = ''
      if (presetFilter === 'Live') {
        checkField = matchInfo.liveHandicapType
      } else {
        checkField = matchInfo.nonLiveHandicapType
      }
      let hdp_point = 0
      if (checkField === 'Away' && oddsEvent.point < 0) {
        hdp_point = Math.abs(oddsEvent.point)
      } else {
        hdp_point = oddsEvent.point * -1
      }

      const findTicket = Sbobet.findOne({
        altLineId: oddsEvent?.id
      }) as DataCrawlType

      if (!findTicket) {
        const dataSave = {
          HDP: CONVERT_HDP[toPositiveNumber(Math.abs(oddsEvent.point))],
          altLineId: oddsEvent.id,
          away: matchInfo.away,
          away_under: oddsEvent.prices[1].price,
          bettype: oddsEvent.isLive ? 1 : 0,
          hdp_point: oddsEvent.marketType.includes('Handicap') ? hdp_point : Math.abs(hdp_point),
          home: matchInfo.home,
          home_over: oddsEvent.prices[0].price,
          idEvent: event?.id,
          idLeague: matchInfo?.idLeague ?? '',
          league: matchInfo.league,
          nameAway: matchInfo?.nameAway,
          nameHome: matchInfo?.nameHome,
          nameLeague: matchInfo?.nameLeague ?? '',
          number: oddsEvent.marketType.includes('FH') ? 1 : 0,
          platform: 'Sbobet',
          redCard: `${matchInfo?.homered ?? 0}-${matchInfo?.awayred ?? 0}`,
          score: `${matchInfo?.livehomescore ?? 0}-${matchInfo?.liveawayscore ?? 0}`,
          specialOdd: SBO_CONFIG_TYPE_ODD[oddsEvent.marketType],
          stat: matchInfo.livetimer ?? '',
          type: oddsEvent.marketType.includes('Handicap') ? 'HDP' : 'OU',
          typeOdd: oddsEvent.marketType.includes('Handicap') ? SPREAD : TOTAL
        }

        records.push(dataSave)
        if (records.length >= BATCH_SIZE) {
          insertRecords(records, Sbobet)
        }
      }

      if (records.length > 0) {
        insertRecords(records, Sbobet)
      }
    }
    const timeEnd = new Date().getTime()
    Account.updateMany(
      { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
      {
        textLog: `Handle Data Odds Event Done. (${eventsLength}, ${timeEnd - timeStart}ms)`
      }
    )
    port.postMessage({ type: 'LogHandleDataSbobet' })
  }

  if (!isAccountActive(account.id) || !checkGameType()) return
  const timeEnd = new Date().getTime()
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Handle Data Odds Event Done All. (${dataSbobetEvent.data.events.length}, ${timeEnd - timeStart}ms)`,
    'Program'
  )

  Account.updateMany(
    { platformName: 'Sbobet', status: 'Logout', statusDelete: 0, statusLogin: 'Success' },
    {
      textLog: `Handle Data Odds Event Done All. (${dataSbobetEvent.data.events.length}, ${timeEnd - timeStart}ms)`
    }
  )
  port.postMessage({ type: 'LogHandleDataSbobet' })
}
