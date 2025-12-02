import { HttpsProxyAgent } from 'https-proxy-agent'

import { OVER } from '@shared/common/constants'
import { TicketInfoDataBetType } from '@shared/common/types'
import { AccountType } from '@shared/common/types'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { API_ENDPOINTS, BET_TYPE_MAP, ODDS_COL_MAP } from '@/worker/platform/Wbet/common/constants'
import { buildBodyBalance, fetchJsonWithDecompress } from '@/worker/platform/Wbet/helper'

export const getTicket_WBet = async (accountInfo: AccountType, ticket: TicketInfoDataBetType) => {
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
      Odds: 0
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

    const isHome = ticket.bet === ticket.nameHome || ticket.bet === OVER

    const bet_type = BET_TYPE_MAP[ticket.type]?.[ticket.number]
    const bet_team_id = isHome
      ? ticket.marketSelectionId_home_over
      : ticket.marketSelectionId_away_under
    const home_away = isHome ? 1 : 2
    const odds_col = ODDS_COL_MAP[ticket.type]?.[isHome ? 'home' : 'away']

    const oddValue = Number(ticket.odd)

    const body = JSON.stringify({
      account_id: accountInfo.loginID,
      ball_display: ticket.HDP,
      bet_team_id,
      bet_type,
      home_away,
      odds_col,
      odds_display: oddValue,
      odds_id: ticket.altLineId,
      odds_mo: oddValue / 0.1,
      odds_type: 1,
      parlay: false,
      session_token: accountInfo.cookie,
      sports_type: 1,
      submatch_id: ticket.submatch_id
    })

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Body: ${body}`,
      'BetList'
    )
    const [dataBalance, dataGetTicket] = await Promise.all([
      await fetchJsonWithDecompress(API_ENDPOINTS.BALANCE, accountInfo, {
        body: JSON.stringify(buildBodyBalance(accountInfo)),
        method: 'POST',
        ...(proxyAgent && { agent: proxyAgent })
      }),
      await fetchJsonWithDecompress(API_ENDPOINTS.BET_CHECK, accountInfo, {
        body,
        method: 'POST',
        ...(proxyAgent && { agent: proxyAgent })
      })
    ])

    if (!dataBalance || dataBalance.status == -500) {
      throw new Error(`Error fetching balance: ${dataBalance.statusdesc || 'Unknown error'}`)
    }
    if (Number(dataBalance.balance) < Number(ticket.betAmount_Standard)) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Credit currently [${dataBalance.balance}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        'BetList'
      )

      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Credit currently [${dataBalance.balance}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        Odds: 0
      }
    }

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Response GetTicket: ${JSON.stringify(dataGetTicket)}`,
      'BetList'
    )

    if (dataGetTicket.status === 313) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `MultiTicket Error 313: ${JSON.stringify(dataGetTicket)}`,
        'BetList'
      )
      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: 'Error: Get Ticket invalidOdds (313)',
        Odds: 0
      }
    }

    if (dataGetTicket.status === 1 && dataGetTicket.statusdesc == 'OK') {
      const odds_check_detail = dataGetTicket.odds_check_details[0]
      const min_bet = odds_check_detail.min_bet
      const max_bet = odds_check_detail.max_bet
      const odds_change = odds_check_detail.odds_change == true
      const odds_display_new = odds_check_detail.odds_display_new

      if (Number(ticket.betAmount_Standard) < Number(min_bet)) {
        await accountLogToFile(
          accountInfo.platformName,
          accountInfo.loginID,
          `Error: Bet Amount [${ticket.betAmount_Standard}] less than Min Bet [${min_bet}]`,
          'BetList'
        )

        return {
          Data: null,
          ErrorCode: 1,
          HDP: ticket.HDP,
          Hdp_point: ticket.hdp_point,
          Message: `Error: Bet Amount [${ticket.betAmount_Standard}] less than Min Bet [${min_bet}]`,
          Odds: 0
        }
      }

      if (Number(ticket.betAmount_Standard) > Number(max_bet)) {
        await accountLogToFile(
          accountInfo.platformName,
          accountInfo.loginID,
          `Error: Bet Amount [${ticket.betAmount_Standard}] more than Max Bet [${max_bet}]`,
          'BetList'
        )

        return {
          Data: null,
          ErrorCode: 1,
          HDP: ticket.HDP,
          Hdp_point: ticket.hdp_point,
          Message: `Error: Bet Amount [${ticket.betAmount_Standard}] more than Max Bet [${max_bet}]`,
          Odds: 0
        }
      }

      return {
        Data: dataGetTicket,
        ErrorCode: 0,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: odds_change ? 'ODDS_CHANGE' : 'OK',
        Odds: odds_change ? Number(odds_display_new) : ticket.odd
      }
    } else {
      throw new Error(`Error: ${dataGetTicket.statusdesc || 'Unknown error'}`)
    }
  } catch (error) {
    console.log(
      'Fetch WBet Get Ticket Fail:',
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
      Odds: 0
    }
  }
}
