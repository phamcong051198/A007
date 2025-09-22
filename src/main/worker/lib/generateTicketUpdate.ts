import { formatTime } from '@/worker/lib/formatTime'

export const generateTicketUpdate = (
  dataTicketI: { platform: string; number: number },
  bet1: string,
  odd1: number,
  infoOdd1: string,
  dataTicketII: { platform: string; number: number },
  bet2: string,
  odd2: number,
  infoOdd2: string,
  profit: number,
  gameType: string
) => {
  const createTicket = (
    data: { platform: string; number: number },
    bet: string,
    odd: number,
    info: string
  ) => ({
    ...data,
    bet,
    odd,
    profit,
    info,
    betAmount_Standard: '0',
    company: data.platform,
    coverage: data.number === 0 ? 'FT' : 'FirstHalf',
    gameType,
    time: formatTime(),
    receiptID: '',
    receiptStatus: ''
  })

  return [
    createTicket(dataTicketI, bet1, odd1, infoOdd1),
    createTicket(dataTicketII, bet2, odd2, infoOdd2)
  ]
}
