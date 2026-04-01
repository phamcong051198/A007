import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { AccountType, TicketInfoDataBetType } from '@shared/common/types'
import { OPTIONS_PROXY } from '@shared/main/constants'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { buildPlatformUrl } from '@/worker/platform/P88/helper'
import { buildHeadersPs3838, ODD_CODE } from '@/worker/platform/Ps3838/common/contants'
import { resBalance_Ps3838, TypeGetTickets_Ps3838 } from '@/worker/platform/Ps3838/common/types'

export const getTicket_Ps3838 = async (accountInfo: AccountType, ticket: TicketInfoDataBetType) => {
  if (!ticket.isBetAllowed) {
    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      ticket.betRejectionReason,
      'BetList'
    )
    return {
      Data: null,
      ErrorCode: 400,
      HDP: ticket.HDP,
      Hdp_point: ticket.hdp_point,
      Message: 'No Bet By User',
      Odds: ticket.odd || 0
    }
  }
  await accountLogToFile(accountInfo.platformName, accountInfo.loginID, '', 'BetList')
  await accountLogToFile(
    accountInfo.platformName,
    accountInfo.loginID,
    `------------------------------------------------------------------------------------------------------------------------------------------`,
    'BetList'
  )
  await accountLogToFile(
    accountInfo.platformName,
    accountInfo.loginID,
    `--------------------[[${`GameType ${ticket.gameType}`}] ${ticket.nameHome} -vs- ${ticket.nameAway}: Bet ${ticket.bet}, ${ticket.number == 0 ? 'FullTime' : '1StHalf'} ${ticket.type}@${ticket.bet.trim() == ticket.nameAway.trim() ? -Number(ticket.hdp_point) : ticket.hdp_point}, Odd: ${ticket.odd} ]--------------------`,
    'BetList'
  )
  await accountLogToFile(accountInfo.platformName, accountInfo.loginID, '', 'BetList')

  try {
    const { status, data } = isProxyConfigValid(accountInfo)

    const { newIpAddress, newPort, newUsername, newPassword } = data
    const proxyUrl =
      status && accountInfo.proxyScope !== OPTIONS_PROXY.NONE
        ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
        : undefined

    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

    const halfType = ticket.number === 0 ? 'FT' : 'FH'
    const oddType = ticket.specialOdd === 1 ? '' : '0'
    const betType = ticket.typeOdd === 'SPREAD' ? 'HDP' : 'POINT'
    const betSide = ticket.bet === ticket.nameHome || ticket.bet === 'Over' ? 'HOME' : 'AWAY'

    const pointSide = ticket.bet === 'Over' ? 'OVER' : 'UNDER'
    const code =
      ODD_CODE[halfType][betType][oddType + betSide] ||
      ODD_CODE[halfType][betType][oddType + pointSide]

    const type = ticket.bet === 'Over' || ticket.bet === ticket.nameHome ? 0 : 1
    const point = ticket.bet === ticket.nameAway ? -ticket.hdp_point : ticket.hdp_point

    const oddsId = `${ticket.idEvent}|${code}|${point}`
    const selectionId = `${ticket.altLineId}|${oddsId}|${type}`

    const body = JSON.stringify({
      oddsSelections: [
        {
          oddsFormat: 4,
          oddsId,
          oddsSelectionsType: 'NORMAL',
          selectionId
        }
      ]
    })

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Getting Multi Ticket Data: ${ticket.bet}, ${ticket.number == 0 ? 'FullTime' : '1StHalf'} ${ticket.type}@${ticket.bet.trim() == ticket.nameAway.trim() ? -Number(ticket.hdp_point) : ticket.hdp_point}, Odd: ${ticket.odd}`,
      'BetList'
    )

    const resKeepAlive = await fetch(buildPlatformUrl(accountInfo, 'KEEP_ALIVE'), {
      headers: {
        ...buildHeadersPs3838(accountInfo),
        Cookie: accountInfo.cookie
      },
      method: 'GET',
      ...(proxyAgent && { agent: proxyAgent })
    })

    const vHucode = resKeepAlive.headers.get('v-hucode')

    if (!vHucode) {
      throw new Error('Ps3838 V-hucode not found')
    }

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Payload: ${body}`,
      'BetList'
    )

    const [resBalance, resGetTickets] = await Promise.all([
      fetch(buildPlatformUrl(accountInfo, 'BALANCE'), {
        headers: {
          ...buildHeadersPs3838(accountInfo, vHucode),
          Cookie: accountInfo.cookie
        },
        method: 'GET',
        ...(proxyAgent && { agent: proxyAgent })
      }),
      fetch(buildPlatformUrl(accountInfo, 'MULTI_TICKET'), {
        headers: {
          ...buildHeadersPs3838(accountInfo, vHucode),
          Cookie: accountInfo.cookie
        },
        method: 'POST',
        ...(proxyAgent && { agent: proxyAgent }),
        body
      })
    ])
    const resDataBalance: resBalance_Ps3838 = await resBalance.json()

    if (resDataBalance.betCredit < +ticket.betAmount_Standard) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Credit currently [${resDataBalance.betCredit}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        'BetList'
      )

      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Credit currently [${resDataBalance.betCredit}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        Odds: ticket.odd || 0
      }
    }

    const dataMultiTicket: TypeGetTickets_Ps3838[] = await resGetTickets.json()
    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Response MultiTicket: ${JSON.stringify(dataMultiTicket)}`,
      'BetList'
    )

    if ('error' in dataMultiTicket && dataMultiTicket.error === 403) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `MultiTicket Error 403: ${JSON.stringify(dataMultiTicket)}`,
        'BetList'
      )
      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: 'Error: Get Ticket Forbidden (403)',
        Odds: ticket.odd || 0
      }
    }

    if (dataMultiTicket[0].status != 'OK' && dataMultiTicket[0].status != 'ODDS_CHANGE') {
      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Ticket status ${dataMultiTicket[0].status}`,
        Odds: ticket.odd || 0
      }
    }

    if (+ticket.betAmount_Standard < (dataMultiTicket[0].minStake ?? 0)) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Bet Amount [${ticket.betAmount_Standard}] less than Min Bet [${dataMultiTicket[0].minStake}]`,
        'BetList'
      )

      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Bet Amount [${ticket.betAmount_Standard}] less than Min Bet [${dataMultiTicket[0].minStake}]`,
        Odds: ticket.odd || 0
      }
    }

    return {
      Data: dataMultiTicket[0],
      ErrorCode: 0,
      HDP: ticket.HDP,
      Hdp_point: ticket.hdp_point,
      Message: dataMultiTicket[0].status == 'ODDS_CHANGE' ? 'ODDS_CHANGE' : 'OK',
      Odds: Number(dataMultiTicket[0].odds)
    }
  } catch (error) {
    console.log(
      'Fetch Ps3838 Get Ticket Fail:',
      error instanceof Error ? error.message : String(error)
    )

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Get Ticket Fail: ${error instanceof Error ? error.message : String(error)}`,
      'BetList'
    )
    return {
      Data: null,
      ErrorCode: 1,
      HDP: ticket.HDP,
      Hdp_point: ticket.hdp_point,
      Message: `Error: Get Ticket Fail ${error instanceof Error ? error.message : 'Unknown Error'}`,
      Odds: ticket.odd || 0
    }
  }
}
