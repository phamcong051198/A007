import { Account } from '@db/model'
import { TicketInfoDataBetType } from '@shared/common/types'

export const checkAccountContinues = (ticketPair: TicketInfoDataBetType[]) => {
  const [ticketI, ticketII]: TicketInfoDataBetType[] = ticketPair

  const checkAccount = (ticket: TicketInfoDataBetType) =>
    Account.findOne({
      id: ticket.idAccount,
      status: 'Logout',
      checkBoxBet: 1,
      statusLogin: 'Success',
      statusPair: 1,
      statusDelete: 0
    })

  const accountInfoI = checkAccount(ticketI)
  const accountInfoII = checkAccount(ticketII)

  if (accountInfoI && accountInfoII) {
    return { accountInfoI, accountInfoII }
  }

  return false
}
