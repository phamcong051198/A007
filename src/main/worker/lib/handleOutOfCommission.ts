import { checkClearData } from '@/worker/lib/checkClearData'
import { formatTime } from '@/worker/lib/formatTime'
import { BetListResult } from '@db/model'
import { TicketInfoDataBetType } from '@shared/common/types'
import { MessagePort } from 'worker_threads'

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
      odd: oddI,
      info: `Out of Commission${originalOddI !== Number(oddI) ? `: ${originalOddI} -> ${oddI}` : ''}`,
      time: formatTime()
    },
    {
      ...ticketII,
      odd: oddII,
      info: `Out of Commission${originalOddII !== Number(oddII) ? `: ${originalOddII} -> ${oddII}` : ''}`,
      time: formatTime()
    }
  ]

  checkClearData()
  const recordDB = BetListResult.create({
    dataPair: JSON.stringify(ticketUpdate)
  })
  port.postMessage({ type: 'BetList', recordDB })
}
