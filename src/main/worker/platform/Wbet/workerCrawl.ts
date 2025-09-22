/* eslint-disable no-constant-condition */
import { HttpsProxyAgent } from 'https-proxy-agent'
import { setTimeout } from 'timers/promises'
import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { Account, clearTable, createModel, Setting } from '@db/model'
import { AccountType, SettingType } from '@shared/common/types'
import { parentPort } from 'worker_threads'
import { isAccountActive } from '@/worker/lib/checkAccount'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { OPTIONS_PROXY, PLATFORM, STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

import { GAME_TYPES } from '@shared/common/constants'
import {
  buildBodyBalance,
  buildBodyMarket,
  buildBodyMatch,
  fetchJsonWithDecompress,
  handleDataOdds_HDP,
  handleDataOdds_OU
} from '@/worker/platform/Wbet/helper'
import {
  API_ENDPOINTS,
  KEY_UX_MATCH_ODDS,
  PARAM_UX_MATCH
} from '@/worker/platform/Wbet/common/constants'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

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
        PLATFORM.WBET,
        JSON.stringify(error),
        'Program'
      )
    }
  }
})

const handleCrawlData = async () => {
  while (true) {
    const listAccount = Account.findAll({
      platformName: PLATFORM.WBET,
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

  try {
    const dataBalance = await fetchJsonWithDecompress(API_ENDPOINTS.BALANCE, account, {
      method: 'POST',
      body: JSON.stringify(buildBodyBalance(account)),
      ...(proxyAgent && { agent: proxyAgent })
    })

    if (!dataBalance || dataBalance.status == -500) {
      throw new Error(`Error fetching balance: ${dataBalance.statusdesc || 'Unknown error'}`)
    }

    isAccountActive(account.id) &&
      Account.update({ id: account.id }, { credit: String(dataBalance.balance) || 0 }) &&
      port.postMessage({
        type: 'DataUpdateAccount',
        idAccount: account.id
      })

    const dataMarket = await fetchJsonWithDecompress(API_ENDPOINTS.UX_MARKET, account, {
      method: 'POST',
      body: JSON.stringify(buildBodyMarket(gameType, account)),
      ...(proxyAgent && { agent: proxyAgent })
    })

    await handleData({ dataMarket, account, proxyAgent })
  } catch (error) {
    console.error('Error Crawl Data Wbet:', error instanceof Error ? error.message : String(error))

    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Error Crawl Data Wbet And LoggedAgain: ${error instanceof Error ? error.message : 'Fetch DATA_ODDS error.'}`,
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

const handleData = async ({ dataMarket, account, proxyAgent }) => {
  clearTable(PLATFORM.WBET)
  if (!gameType || gameType === GAME_TYPES.NONE) return
  const WBet = createModel(PLATFORM.WBET, dataCrawlByPlatformSchema)

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
        platformName: PLATFORM.WBET,
        statusDelete: 0
      },
      {
        textLog: `Get Soccer ${gameType}...`
      }
    )
    port.postMessage({ type: 'LogHandleDataWbet' })
  } else return

  const leagues = dataMarket.data[0]
  const matchs = dataMarket.data[1]

  if (leagues.length === 0 || matchs.length === 0) {
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
          platformName: PLATFORM.WBET
        },
        {
          textLog: `Soccer ${gameType}: No data.`
        }
      )
      port.postMessage({ type: 'LogHandleDataWbet' })
    }
    return
  }

  // Step 1: Xử lý Call data lấy Odds
  const eventsLength = matchs.length
  const timeStart = new Date().getTime()

  const payload = buildBodyMatch(gameType, account, matchs)
  try {
    const res_UX_MATCH = await fetchJsonWithDecompress(
      `${API_ENDPOINTS.UX_MATCH}?match=${PARAM_UX_MATCH[gameType]}`,
      account,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        ...(proxyAgent && { agent: proxyAgent })
      }
    )
    const data = res_UX_MATCH.data

    const dataOdds = data[0][Object.keys(data[0])[0]]

    const dataOdds_HDP = dataOdds[KEY_UX_MATCH_ODDS.HDP]
    const dataOdds_OU = dataOdds[KEY_UX_MATCH_ODDS.OU]

    await Promise.all([
      handleDataOdds_HDP(dataOdds_HDP, leagues, matchs, isBSoft, gameType, WBet),
      handleDataOdds_OU(dataOdds_OU, leagues, matchs, isBSoft, gameType, WBet)
    ])

    const timeEnd = new Date().getTime()
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Handle Data All Event Done. (${eventsLength}, ${timeEnd - timeStart}ms)`,
      'Program'
    )
    if (isAccountActive(account.id)) {
      Account.updateMany(
        {
          status: STATUS_ACCOUNT.LOGOUT,
          statusDelete: 0,
          statusLogin: STATUS_LOGIN.SUCCESS,
          platformName: PLATFORM.WBET
        },
        {
          textLog: `Handle Data All Event Done. (${eventsLength}, ${timeEnd - timeStart}ms)`
        }
      )
      port.postMessage({ type: 'LogHandleDataWbet' })
    } else return
  } catch (error) {
    throw new Error(
      `Error fetching odds: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
