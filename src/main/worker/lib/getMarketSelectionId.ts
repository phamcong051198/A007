import { TicketInfoDataBetType } from '@shared/common/types'

export const getMarketSelectionId = (ticket: TicketInfoDataBetType) => {
  const bet = ticket.bet.trim()

  if (bet === 'Under' || bet === ticket.nameAway.trim()) {
    return ticket.marketSelectionId_away_under
  } else {
    return ticket.marketSelectionId_home_over
  }
}
