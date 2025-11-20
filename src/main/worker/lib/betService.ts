import { getTicket_P88Bet } from '@/worker/platform/P88/actions/getTicket'
import { getTicket_Viva88Bet } from '@/worker/platform/Viva88/actions/getTicket'
import { placeBet_P88Bet } from '@/worker/platform/P88/actions/placeBet'
import { placeBet_Viva88Bet } from '@/worker/platform/Viva88/actions/placeBet'
import { TicketInfoDataBetType, AccountType } from '@shared/common/types'
import { getTicket_Sbobet } from '../platform/Sbobet/actions/getTicket'
import { placeBet_Sbobet } from '../platform/Sbobet/actions/placeBet'
import { getTicket_WBet } from '@/worker/platform/Wbet/actions/getTicket'
import { placeBet_WBet } from '@/worker/platform/Wbet/actions/placeBet'
import { getTicket_3in1Bet } from '@/worker/platform/3In1bet/actions/getTicket'
import { placeBet_3in1Bet } from '@/worker/platform/3In1bet/actions/placeBet'

const BetPlatformServices = {
  P88Bet: {
    getTicket: getTicket_P88Bet,
    placeBet: placeBet_P88Bet
  },
  Viva88Bet: {
    getTicket: getTicket_Viva88Bet,
    placeBet: placeBet_Viva88Bet
  },
  Sbobet: {
    getTicket: getTicket_Sbobet,
    placeBet: placeBet_Sbobet
  },
  WBet: {
    getTicket: getTicket_WBet,
    placeBet: placeBet_WBet
  },
  '3in1Bet': {
    getTicket: getTicket_3in1Bet,
    placeBet: placeBet_3in1Bet
  }
} as const

export const handleGetTicket = async (ticket: TicketInfoDataBetType, accountInfo: AccountType) => {
  const handler = BetPlatformServices[ticket.platform]
  return await handler.getTicket(accountInfo, ticket)
}

export const handleBetTicket = async (
  ticket: TicketInfoDataBetType,
  accountInfo: AccountType,
  dataPlaceBet
) => {
  const handler = BetPlatformServices[ticket.platform]
  return await handler.placeBet(ticket, accountInfo, dataPlaceBet)
}

export const handleReBetTicket = async (
  ticket: TicketInfoDataBetType,
  accountInfo: AccountType,
  betPlatform: string,
  retries = 30
): Promise<{
  ErrorCode: number
  Data: { info: string; receiptID: string; receiptStatus: string; odd: number }
}> => {
  let messageError = 'Error: Retry Failed'

  const platformHandler = BetPlatformServices[betPlatform]
  if (!platformHandler) {
    throw new Error(`Unsupported betting platform: ${betPlatform}`)
  }

  const { getTicket, placeBet } = platformHandler

  for (let i = 0; i < retries; i++) {
    const {
      ErrorCode: errorCodeGetTicket,
      Message,
      Hdp_point,
      HDP,
      Odds,
      Data: dataGetTicket
    } = await getTicket(accountInfo, ticket)

    if (errorCodeGetTicket === 1 || !dataGetTicket) {
      console.log(Message)
      continue
      // return {
      //   ErrorCode: 1,
      //   Data: { info: Message, receiptID: '', receiptStatus: 'Fail', odd: Odds }
      // }
    }

    const ticketUpdate = { ...ticket, hdp_point: Hdp_point, HDP, odd: Odds }
    const { ErrorCode, Data } = await placeBet(ticketUpdate, accountInfo, dataGetTicket)

    if (ErrorCode == 0) {
      return { ErrorCode, Data: { ...Data, odd: Odds } }
    }

    messageError = Data.info
  }

  return {
    ErrorCode: 1,
    Data: { info: messageError, receiptID: '', receiptStatus: 'Fail', odd: ticket.odd }
  }
}
