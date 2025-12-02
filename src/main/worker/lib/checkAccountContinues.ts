import { Account } from '@db/model'

import { TicketInfoDataBetType } from '@shared/common/types'

export const checkAccountContinues = (ticketPair: TicketInfoDataBetType[]) => {
  const [ticketI, ticketII]: TicketInfoDataBetType[] = ticketPair

  const checkAccount = (ticket: TicketInfoDataBetType) =>
    Account.findOne({
      checkBoxBet: 1,
      id: ticket.idAccount,
      status: 'Logout',
      statusDelete: 0,
      statusLogin: 'Success',
      statusPair: 1
    })

  const accountInfoI = checkAccount(ticketI)
  const accountInfoII = checkAccount(ticketII)

  if (accountInfoI && accountInfoII) {
    return { accountInfoI, accountInfoII }
  }

  return false
}
