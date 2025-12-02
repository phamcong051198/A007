import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { AccountType } from '@shared/common/types'
import { TicketInfoDataBetType } from '@shared/common/types'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { handleBetError, handleBetSuccess } from '@/worker/lib/handleLogBet'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { toQueryString } from '@/worker/lib/toQueryString'
import { DataTypeGetTickets_Viva88, TypeGetBetListApi } from '@/worker/platform/Viva88/common/types'
import { configHeaders } from '@/worker/platform/Viva88/helper'

export const placeBet_Viva88Bet = async (
  ticket: TicketInfoDataBetType,
  accountInfo: AccountType,
  dataPlaceBet: {
    dataGetTicketInfo: DataTypeGetTickets_Viva88
    authorization: string
  }
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

  const { dataGetTicketInfo, authorization } = dataPlaceBet
  const stake = Number(ticket.betAmount_Standard)
  const itemListProcessBet = [
    {
      AcceptBetterOdds: true,
      Ascore: dataGetTicketInfo.LiveAwayScore,
      Away: dataGetTicketInfo.AwayName,
      Betteam: dataGetTicketInfo.Betteam,
      Bettype: dataGetTicketInfo.Bettype,
      ChoiceValue: dataGetTicketInfo.ChoiceValue,
      ErrorCode: dataGetTicketInfo.ErrorCode,
      Gameid: 1,
      Guid: dataGetTicketInfo.Guid,
      Hdp1: dataGetTicketInfo.Hdp1,
      Hdp2: dataGetTicketInfo.Hdp2,
      Home: dataGetTicketInfo.HomeName,
      Hscore: dataGetTicketInfo.LiveHomeScore,
      IsInPlay: dataGetTicketInfo.IsInPlay,
      Line: dataGetTicketInfo.Line,
      LuckyDrawMinBet: dataGetTicketInfo.LuckyDrawMinBet,
      MMR: '',
      MRPercentage: dataGetTicketInfo.MRPercentage,
      Matchid: dataGetTicketInfo.Matchid,
      Odds: dataGetTicketInfo.SrcOdds,
      Oddsid: dataGetTicketInfo.OddsID,
      ProgramID: '',
      RaceNum: 0,
      RecommendType: dataGetTicketInfo.RecommendType,
      Runner: 0,
      SrcOddsInfo: dataGetTicketInfo.SrcOddsInfo,
      Stake:
        stake > parseFloat(dataGetTicketInfo.Maxbet.replace(/,/g, ''))
          ? dataGetTicketInfo.Maxbet
          : stake,
      TicketTime: dataGetTicketInfo.TicketTime,
      Type: dataGetTicketInfo.TicketType,
      isQuickBet: true,
      isTablet: false,
      parentMatchId: dataGetTicketInfo.ParentMatchid,
      sinfo: dataGetTicketInfo.sinfo
    }
  ]
  await accountLogToFile(
    accountInfo.platformName,
    accountInfo.loginID,
    `Betting Info: ${ticket.bet}, ${ticket.number == 0 ? 'FullTime' : '1StHalf'} ${ticket.type}@${ticket.bet.trim() == ticket.nameAway.trim() ? -Number(ticket.hdp_point) : ticket.hdp_point}, Odd: ${ticket.odd}`,
    'BetList'
  )
  const {
    ErrorCode: ErrorCode_ProcessBet,
    Info,
    receiptID
  } = await bettingProcessBet__Viva88Bet(accountInfo, authorization, itemListProcessBet)

  return {
    // 0: Success, 1: Fail, 2: Retry
    Data: {
      info: Info,
      receiptID,
      receiptStatus: ErrorCode_ProcessBet == 0 ? 'Success' : 'Fail'
    },
    ErrorCode: ErrorCode_ProcessBet
  }
}

async function bettingProcessBet__Viva88Bet(
  accountInfo: AccountType,
  authorization: string,
  itemListProcessBet
) {
  const { platformName, loginID, host } = accountInfo
  try {
    const { status, data } = isProxyConfigValid(accountInfo)
    const { newIpAddress, newPort, newUsername, newPassword } = data

    const proxyUrl =
      status && accountInfo.proxyScope !== 'None'
        ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
        : undefined

    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

    const urlProcessBet = `${host}/Betting/ProcessBet`
    const paramsProcessBet = {
      LicUserName: '',
      OddsType: 4,
      WebSkinType: 3
    }

    const body = toQueryString(itemListProcessBet, paramsProcessBet)
    await accountLogToFile(
      accountInfo.platformName,
      accountInfo.loginID,
      `Body: ${body}`,
      'BetList'
    )
    const fetchProcessBet = async () => {
      const resProcessBet = await fetch(urlProcessBet, {
        headers: { ...configHeaders(accountInfo), Authorization: `bearer ${authorization}` },
        method: 'POST',
        ...(proxyAgent && { agent: proxyAgent }),
        body
      })
      return resProcessBet.json() as Promise<TypeGetBetListApi>
    }
    const dataProcessBet: TypeGetBetListApi = await fetchProcessBet()
    await accountLogToFile(
      platformName,
      loginID,
      `Response BET_PLACEMENT: ${JSON.stringify(dataProcessBet)}`,
      'BetList'
    )

    if (dataProcessBet.ErrorCode === 105) {
      const errorCode = dataProcessBet.ErrorMsg
      await accountLogToFile(
        platformName,
        loginID,
        `Status BET_PLACEMENT: FAIL (${errorCode})`,
        'BetList'
      )
      return { ErrorCode: 2, Info: errorCode, receiptID: '' }
    }

    if (dataProcessBet.ErrorCode === 0) {
      if ([2, 15, 65].includes(dataProcessBet.Data.ItemList[0].Code)) {
        const errorCode = dataProcessBet.Data.ItemList[0].Message
        await accountLogToFile(
          platformName,
          loginID,
          `Status BET_PLACEMENT: FAIL (${errorCode})`,
          'BetList'
        )
        return { ErrorCode: 2, Info: errorCode, receiptID: '' }
      }
      if ([0, 1].includes(dataProcessBet.Data.ItemList[0].Code)) {
        return handleBetSuccess(platformName, loginID, dataProcessBet.Data.ItemList[0].TransId_Cash)
      }
    }

    const errorCode =
      dataProcessBet.ErrorMsg && dataProcessBet.ErrorMsg !== null
        ? JSON.stringify(dataProcessBet.ErrorMsg)
        : JSON.stringify(dataProcessBet.Data.ItemList[0]?.Message || 'Unknown error')
    return handleBetError(platformName, loginID, errorCode)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Viva88Bet BET_PLACEMENT Fail:', errorMessage)
    return handleBetError(platformName, loginID, `${errorMessage}`)
  }
}
