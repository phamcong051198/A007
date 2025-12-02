import { TicketDelaySec } from '@db/model'

import { TicketInfoDataBetType } from '@shared/common/types'
import { TicketForDelaySecType } from '@shared/main/types'

export function UpsertTicketDelaySec(ticket: TicketInfoDataBetType) {
  const ticketDelaySec = TicketDelaySec.findOne({
    bet: ticket.bet,
    company: ticket.company,
    hdp_point: ticket.hdp_point,
    idEvent: ticket.idEvent,
    idLeague: ticket.idLeague,
    number: ticket.number,
    type: ticket.type
  }) as TicketForDelaySecType

  if (ticketDelaySec) {
    TicketDelaySec.update({ id: ticketDelaySec.id }, { timestamp: ticket.time })
  } else {
    TicketDelaySec.create({
      bet: ticket.bet,
      company: ticket.company,
      hdp_point: ticket.hdp_point,
      idEvent: ticket.idEvent,
      idLeague: ticket.idLeague,
      number: ticket.number,
      platform: ticket.platform,
      timestamp: ticket.time,
      type: ticket.type
    })
  }
}
