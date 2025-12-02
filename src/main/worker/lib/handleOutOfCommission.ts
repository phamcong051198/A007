import { MessagePort } from 'worker_threads'

import { BetListResult } from '@db/model'

import { TicketInfoDataBetType } from '@shared/common/types'

import { checkClearData } from '@/worker/lib/checkClearData'
import { formatTime } from '@/worker/lib/formatTime'

export function handleOutOfCommission(
  port: MessagePort,
  ticketI: TicketInfoDataBetType,
  ticketII: TicketInfoDataBetType,
  oddI: number | string,
  oddII: number | string,
  originalOddI: number,
  originalOddII: number
) {
  const ticketUpdate = [
    {
      ...ticketI,
      info: `Out of Commission${originalOddI !== Number(oddI) ? `: ${originalOddI} -> ${oddI}` : ''}`,
      odd: oddI,
      time: formatTime()
    },
    {
      ...ticketII,
      info: `Out of Commission${originalOddII !== Number(oddII) ? `: ${originalOddII} -> ${oddII}` : ''}`,
      odd: oddII,
      time: formatTime()
    }
  ]

  checkClearData()
  const recordDB = BetListResult.create({
    dataPair: JSON.stringify(ticketUpdate)
  })
  port.postMessage({ recordDB, type: 'BetList' })
}
