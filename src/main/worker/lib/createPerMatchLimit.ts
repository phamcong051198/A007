import { PerMatchLimit } from '@db/model'

import { TicketInfoDataBetType } from '@shared/common/types'

export const CreatePerMatchLimit = (idAccount: number, Ticket: TicketInfoDataBetType) => {
  const { league, home, away, type, hdp_point, betAmount_Standard, odd } = Ticket

  PerMatchLimit.create({
    away,
    betAmount_Standard,
    hdp_point,
    home,
    idAccount,
    league,
    odd,
    type
  })
}
