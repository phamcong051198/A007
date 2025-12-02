import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { TicketInfoDataBetType } from '@shared/common/types'
import { AccountType } from '@shared/common/types'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { OddsInfoItem_TicketSbobet, TypeTicket_Sbobet } from '@/worker/platform/Sbobet/common/types'

export const getTicket_Sbobet = async (accountInfo: AccountType, ticket: TicketInfoDataBetType) => {
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

    const dataPost = {
      eventId: ticket.idEvent,
      isLive: ticket.betType === 1 ? true : false,
      marketType: ticket.specialOdd,
      oddsId: ticket.altLineId,
      option: ticket.bet === ticket.nameHome || ticket.bet === 'Over' ? 'h' : 'a',
      sportType: 1
    }

    const headersGetToken = {
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      'Content-Type': 'application/json',
      Cookie: accountInfo.cookie,
      Origin: accountInfo.host,
      Referer: accountInfo.host,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      Traceparent: '00-c629284fb3113891ff9b3462b6ef0f3d-492ebcb2530cc7db-00',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      ...(accountInfo.customIP ? { 'X-Forwarded-For': accountInfo.customIP } : {})
    }

    const urlMultiTicket = `${accountInfo.host}api/singleBetSlip/openTicket`

    const body = JSON.stringify(dataPost)
    const response = await fetch(urlMultiTicket, {
      headers: headersGetToken,
      method: 'POST',
      ...(proxyAgent && { agent: proxyAgent }),
      body
    })
    const nameOddInfo = dataPost.oddsId + '-' + dataPost.option
    const dataMultiTicket: TypeTicket_Sbobet = await response.json()
    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Response MultiTicket: ${JSON.stringify(dataMultiTicket)}`,
      'BetList'
    )
    if (dataMultiTicket.errorCode !== 0) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `MultiTicket Fail: ${JSON.stringify(dataMultiTicket)}`,
        'BetList'
      )
      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Get MultiTicket Fail`,
        Odds: 0
      }
    }

    if (dataMultiTicket.balance < +ticket.betAmount_Standard) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Credit currently [${dataMultiTicket.balance}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        'BetList'
      )

      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Credit currently [${dataMultiTicket.balance}] less than bet amount setting [${ticket.betAmount_Standard}]`,
        Odds: 0
      }
    }

    if (+ticket.betAmount_Standard < (dataMultiTicket.minBet ?? 0)) {
      await accountLogToFile(
        accountInfo.platformName,
        accountInfo.loginID,
        `Error: Bet Amount [${ticket.betAmount_Standard}] less than Min Bet [${dataMultiTicket.minBet}]`,
        'BetList'
      )

      return {
        Data: null,
        ErrorCode: 1,
        HDP: ticket.HDP,
        Hdp_point: ticket.hdp_point,
        Message: `Error: Bet Amount [${ticket.betAmount_Standard}] less than Min Bet [${dataMultiTicket.minBet}]`,
        Odds: 0
      }
    }

    const oddInfo = dataMultiTicket.oddsInfo[nameOddInfo]

    const dataGetOdds = {
      ...oddInfo,
      eventId: ticket.idEvent,
      marketType: ticket.specialOdd,
      maxStake: dataMultiTicket.maxBet,
      minStake: dataMultiTicket.minBet,
      option: dataPost.option
    } as OddsInfoItem_TicketSbobet

    return {
      Data: dataGetOdds,
      ErrorCode: 0,
      HDP: ticket.HDP,
      Hdp_point: ticket.hdp_point,
      Message: Number(ticket?.odd) === Number(oddInfo.price) ? 'OK' : 'ODDS_CHANGE',
      Odds: oddInfo.price
    }
  } catch (error) {
    console.log(
      'Fetch Sbobet Get Ticket Fail:',
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
