import { PerMatchLimit } from '@db/model'
import { TicketInfoDataBetType } from '@shared/common/types'

export const CreatePerMatchLimit = (idAccount: number, Ticket: TicketInfoDataBetType) => {
  const { league, home, away, type, hdp_point, betAmount_Standard, odd } = Ticket

  PerMatchLimit.create({
    league,
    home,
    away,
    type,
    hdp_point,
    odd,
    betAmount_Standard,
    idAccount
  })
}
