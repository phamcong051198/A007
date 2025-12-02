import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'

import { AccountType } from '@shared/common/types'
import { TicketInfoDataBetType } from '@shared/common/types'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { handleBetError, handleBetSuccess } from '@/worker/lib/handleLogBet'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { buildHeadersP88Bet } from '@/worker/platform/P88/common/contants'
import { BetResponse_P88, TypeGetTickets_P88 } from '@/worker/platform/P88/common/types'

export const placeBet_P88Bet = async (
  ticket: TicketInfoDataBetType,
  accountInfo: AccountType,
  dataGetTicketInfo: TypeGetTickets_P88
) => {
  if (!ticket.isBetAllowed) {
    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      ticket.betRejectionReason,
      'BetList'
    )
    return {
      Data: {
        info: ticket.betRejectionReason,
        receiptID: '',
        receiptStatus: ''
      },
      ErrorCode: 400
    }
  }

  const {
    ErrorCode: ErrorCode_ProcessBet,
    Info,
    receiptID
  } = await bettingProcessBet__P88Bet(accountInfo, ticket, dataGetTicketInfo)

  return {
    // 0: Success, 1: Fail, 2: Retry
    Data: {
      info: String(Info),
      receiptID,
      receiptStatus: ErrorCode_ProcessBet == 0 ? 'Success' : 'Fail'
    },
    ErrorCode: ErrorCode_ProcessBet
  }
}

async function bettingProcessBet__P88Bet(
  accountInfo: AccountType,
  ticket: TicketInfoDataBetType,
  dataGetTicketInfo: TypeGetTickets_P88
) {
  const { platformName, loginID, cookie } = accountInfo

  try {
    const { status: statusProxyConfigValid, data } = isProxyConfigValid(accountInfo)
    const { newIpAddress, newPort, newUsername, newPassword } = data

    const proxyUrl =
      statusProxyConfigValid && accountInfo.proxyScope !== 'None'
        ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
        : undefined

    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

    const urlBetPlacement = `https://www.p88.bet/bet-placement/buyV2?uniqueRequestId=${uuidv4()}&locale=en_US&_=${Date.now()}&withCredentials=true`

    const stake = Number(ticket.betAmount_Standard)

    const body = JSON.stringify({
      acceptBetterOdds: false,
      oddsFormat: 4,
      selections: [
        {
          odds: dataGetTicketInfo.odds,
          oddsId: dataGetTicketInfo.oddsId,
          selectionId: dataGetTicketInfo.selectionId,
          stake: stake > (dataGetTicketInfo.maxStake ?? 0) ? dataGetTicketInfo.maxStake : stake,
          uniqueRequestId: uuidv4(),
          wagerType: 'NORMAL'
        }
      ]
    })

    await accountLogToFile(
      platformName,
      loginID,
      `Betting Info: ${ticket.bet}, ${ticket.number == 0 ? 'FullTime' : '1StHalf'} ${ticket.type}@${ticket.bet.trim() == ticket.nameAway.trim() ? -Number(ticket.hdp_point) : ticket.hdp_point}, Odd: ${ticket.odd}`,
      'BetList'
    )

    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Body: ${body}`,
      'BetList'
    )

    const resBetPlacement = await fetch(urlBetPlacement, {
      headers: {
        ...buildHeadersP88Bet(accountInfo),
        Cookie: cookie
      },
      method: 'POST',
      ...(proxyAgent && { agent: proxyAgent }),
      body
    })
    await accountLogToFile(platformName, loginID, `Payload BET_PLACEMENT: ${body}`, 'BetList')

    const dataBetPlacement: BetResponse_P88 = await resBetPlacement.json()
    await accountLogToFile(
      platformName,
      loginID,
      `Response BET_PLACEMENT: ${JSON.stringify(dataBetPlacement)}`,
      'BetList'
    )

    const response = dataBetPlacement?.response || 'Unknown Error'
    if (!response || response.length === 0) {
      return await handleBetError(platformName, loginID, dataBetPlacement.errorMessage)
    }

    const status = response[0].status
    const wagerId = response[0].wagerId
    const errorCode = response[0]?.errorCode || 'Unknown Error'

    switch (status) {
      case 'ACCEPTED':
      case 'PENDING_ACCEPTANCE':
        return await handleBetSuccess(platformName, loginID, wagerId)
      case 'PROCESSED_WITH_ERROR':
        await accountLogToFile(
          platformName,
          loginID,
          `Status BET_PLACEMENT: FAIL (${errorCode})`,
          'BetList'
        )
        return { ErrorCode: 2, Info: errorCode, receiptID: wagerId }
      default:
        return await handleBetError(
          platformName,
          loginID,
          dataBetPlacement.errorMessage || 'Unknown Error'
        )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('P88Bet BET_PLACEMENT Fail:', errorMessage)
    return await handleBetError(platformName, loginID, `${errorMessage}`)
  }
}
