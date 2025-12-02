import { PerMatchDetail } from '@db/model'
import { PlatformPerMatchDetailsType } from '@db/schema/platformPerMatchDetails'

export const saveOrUpdateBetRecordPerMatchDetail = (ticket) => {
  const existingRecord = PerMatchDetail.findOne({
    HDP: ticket.HDP,
    away: ticket.away,
    bet: ticket.bet,
    coverage: ticket.coverage,
    gameStatus: ticket.gameType,
    home: ticket.home,
    league: ticket.nameLeague,
    platform: ticket.platform
  }) as PlatformPerMatchDetailsType

  if (!existingRecord) {
    PerMatchDetail.create({
      HDP: ticket.HDP,
      amount: ticket.betAmount_Standard,
      away: ticket.away,
      bet: ticket.bet,
      count: '1',
      coverage: ticket.coverage,
      gameStatus: ticket.gameType,
      home: ticket.home,
      league: ticket.nameLeague,
      platform: ticket.platform,
      redCard: ticket.redCard,
      score: ticket.score,
      sport: 'Soccer'
    })
    return
  }
  PerMatchDetail.update(
    { id: existingRecord.id },
    {
      amount: String(Number(ticket.betAmount_Standard) + Number(existingRecord.amount)),
      count: String(Number(existingRecord.count) + 1)
    }
  )
}
