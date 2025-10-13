import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { resBalance_P88, TypeGetTickets_P88 } from '@/worker/platform/P88/common/types'
import { AccountType, TicketInfoDataBetType } from '@shared/common/types'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { buildHeadersP88Bet, ODD_CODE } from '@/worker/platform/P88/common/contants'

export const getTicket_P88Bet = async (accountInfo: AccountType, ticket: TicketInfoDataBetType) => {
  if (!ticket.isBetAllowed) {
    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      ticket.betRejectionReason,
      'BetList'
    )
    return {
      ErrorCode: 400,
      Message: 'No Bet By User',
      Hdp_point: ticket.hdp_point,
      HDP: ticket.HDP,
      Odds: 0,
      Data: null
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
      status && accountInfo.proxyScope !== 'None'
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
    const oddsId = `${ticket.idEvent}|${code}|${ticket.bet === ticket.nameHome ? ticket.hdp_point : ticket.hdp_point < 0 ? ticket.hdp_point * -1 : ticket.hdp_point}`
    const selectionId = `${ticket.altLineId}|${oddsId}|${type}`

    const body = JSON.stringify({
      oddsSelections: [
        {
          oddsFormat: 4,
          oddsSelectionsType: 'NORMAL',
          selectionId,
          oddsId
        }
      ]
    })

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Getting Multi Ticket Data: ${ticket.bet}, ${ticket.number == 0 ? 'FullTime' : '1StHalf'} ${ticket.type}@${ticket.bet.trim() == ticket.nameAway.trim() ? -Number(ticket.hdp_point) : ticket.hdp_point}, Odd: ${ticket.odd}`,
      'BetList'
    )

    const urlBalance = `https://www.p88.bet/member-service/v2/account-balance?locale=en_US&_=${Date.now()}&withCredentials=true`
    const urlMultiTicket = `https://www.p88.bet/member-betslip/v2/all-odds-selections?locale=en_US&_=${Date.now()}&withCredentials=true`

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Body: ${body}`,
      'BetList'
    )

    const [resBalance, resGetTickets] = await Promise.all([
      fetch(urlBalance, {
        method: 'GET',
        headers: {
          ...buildHeadersP88Bet(accountInfo),
          Cookie: accountInfo.cookie
        },
        ...(proxyAgent && { agent: proxyAgent })
      }),
      fetch(urlMultiTicket, {
        method: 'POST',
        headers: {
          ...buildHeadersP88Bet(accountInfo),
          Cookie: accountInfo.cookie
        },
        ...(proxyAgent && { agent: proxyAgent }),
        body
      })
    ])
    const resDataBalance: resBalance_P88 = await resBalance.json()

    if (resDataBalance.betCredit < +ticket.betAmount_Standard) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Credit currently [${resDataBalance.betCredit}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        'BetList'
      )

      return {
        ErrorCode: 1,
        Message: `Error: Credit currently [${resDataBalance.betCredit}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        Hdp_point: ticket.hdp_point,
        HDP: ticket.HDP,
        Odds: 0,
        Data: null
      }
    }

    const dataMultiTicket: TypeGetTickets_P88[] = await resGetTickets.json()
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
        ErrorCode: 1,
        Message: 'Error: Get Ticket Forbidden (403)',
        Hdp_point: ticket.hdp_point,
        HDP: ticket.HDP,
        Odds: 0,
        Data: null
      }
    }

    if (dataMultiTicket[0].status != 'OK' && dataMultiTicket[0].status != 'ODDS_CHANGE') {
      return {
        ErrorCode: 1,
        Message: `Error: Ticket status ${dataMultiTicket[0].status}`,
        Hdp_point: ticket.hdp_point,
        HDP: ticket.HDP,
        Odds: 0,
        Data: null
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
        ErrorCode: 1,
        Message: `Error: Bet Amount [${ticket.betAmount_Standard}] less than Min Bet [${dataMultiTicket[0].minStake}]`,
        Hdp_point: ticket.hdp_point,
        HDP: ticket.HDP,
        Odds: 0,
        Data: null
      }
    }

    return {
      ErrorCode: 0,
      Message: dataMultiTicket[0].status == 'ODDS_CHANGE' ? 'ODDS_CHANGE' : 'OK',
      Hdp_point: ticket.hdp_point,
      HDP: ticket.HDP,
      Odds: Number(dataMultiTicket[0].odds),
      Data: dataMultiTicket[0]
    }
  } catch (error) {
    console.log(
      'Fetch P88 Get Ticket Fail:',
      error instanceof Error ? error.message : String(error)
    )

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Get Ticket Fail: ${error instanceof Error ? error.message : String(error)}`,
      'BetList'
    )
    return {
      ErrorCode: 1,
      Message: `Error: Get Ticket Fail ${error instanceof Error ? error.message : 'Unknown Error'}`,
      Hdp_point: ticket.hdp_point,
      HDP: ticket.HDP,
      Odds: 0,
      Data: null
    }
  }
}
