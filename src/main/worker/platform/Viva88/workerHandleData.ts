/* eslint-disable @typescript-eslint/no-explicit-any */
import { toPositiveNumber } from '@/worker/lib/toPositiveNumber'
import Model, { createModel, EventViva88, IndexViva88, Setting } from '@db/model'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { EventViva88Type } from '@db/schema/eventViva88'
import rootLeagueSchema from '@db/schema/rootLeague'
import { CONVERT_HDP } from '@shared/common/constants'
import { SPREAD, TOTAL } from '@shared/common/constants'
import { DataCrawlType, LeagueType, SettingType } from '@shared/common/types'
import { parentPort } from 'worker_threads'

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async ({ data }) => {
  if (!data) return

  await handleData(data)
})

async function handleData(data: any) {
  const Viva88Bet = createModel('Viva88Bet', dataCrawlByPlatformSchema)
  const League_Viva88Bet = createModel('League_Viva88Bet', rootLeagueSchema)

  const records: any[] = []
  const BATCH_SIZE: number = 50

  const [type, message, content] = JSON.parse(data.substring(2))
  const targetKeys = [
    'matchid',
    'leagueid',
    'leaguenameen',
    'hteamnameen',
    'ateamnameen',
    'oddsstatus',
    'livehomescore',
    'liveawayscore',
    'isht',
    'bettype',
    'kickofftime',
    'liveperiod',
    'livetimer',
    'oddsid',
    'hdp1',
    'hdp2',
    'parenttypeid',
    'odds1a',
    'odds2a'
  ]
  let finalAbsoluteMap: Record<string, number> = {}
  const dataSetting = Setting.findAll() as SettingType[]
  const gameType = dataSetting[0].gameType
  if (type === 'm' && message && content) {
    try {
      for (const row of content) {
        if (row[0] === 'f' && typeof row[1] === 'number' && Array.isArray(row[2])) {
          const fieldGroup = row[1]
          const fieldNames = row[2]

          for (const key of targetKeys) {
            const index = fieldNames.indexOf(key)
            if (index !== -1) {
              finalAbsoluteMap[key] = fieldGroup + index
            }
          }
          const hasAllKeys = targetKeys.every((key) => key in finalAbsoluteMap)
          if (hasAllKeys) {
            IndexViva88.deleteAll()
          }
        }
      }
      if (finalAbsoluteMap && Object.keys(finalAbsoluteMap).length > 0) {
        await IndexViva88.create(finalAbsoluteMap)
      } else {
        const newest = await IndexViva88.getNewest()
        finalAbsoluteMap = newest ? (({ id, ...rest }) => rest)(newest) : {}
      }
      for (const row of content) {
        if (row[1] === 'l') {
          const leagueInfo: Record<string, any> = {}
          for (let i = 0; i < row.length; i += 2) {
            const key = row[i]
            const value = row[i + 1]
            const matchKey = Object.keys(finalAbsoluteMap).find((k) => finalAbsoluteMap[k] == key)
            if (matchKey) {
              leagueInfo[matchKey] = value
            }
          }

          const name = leagueInfo.leaguenameen.toLowerCase()

          if (name.includes('soccer') || name.includes('saba')) continue
          if (name.includes(' - ')) continue

          let findLeague: LeagueType | undefined
          if (leagueInfo.leagueid || leagueInfo.leaguenameen) {
            let nameLeague = leagueInfo.leaguenameen.trim()
            if (nameLeague.startsWith('*')) {
              nameLeague = nameLeague.slice(1).trim()
            }

            findLeague = leagueInfo.leagueid
              ? (League_Viva88Bet.findOne({ idLeague: leagueInfo.leagueid }) as LeagueType)
              : (League_Viva88Bet.findOne({ nameLeague }) as LeagueType)

            if (!findLeague) {
              const data = {
                idLeague: leagueInfo.leagueid,
                nameLeague,
                league: nameLeague.toUpperCase()
              }
              League_Viva88Bet.create(data)
            }
          }
        }
      }

      for (const row of content) {
        if (row[1] === 'm') {
          const matchInfo: Record<string, any> = {}

          const reverseMap = createReverseMap(finalAbsoluteMap)
          for (let i = 0; i < row.length; i += 2) {
            const key = row[i]
            const value = row[i + 1]
            const matchKey = reverseMap[key]
            if (matchKey) {
              matchInfo[matchKey] = value
            }
          }

          const existingEvent = EventViva88.findOne({
            idEvent: matchInfo.matchid
          }) as EventViva88Type

          if (matchInfo.leagueid === undefined && existingEvent) {
            matchInfo.leagueid = existingEvent.idLeague
            matchInfo.hteamnameen = existingEvent.nameHome
            matchInfo.ateamnameen = existingEvent.nameAway
            matchInfo.isht = existingEvent.isht
          }

          const hName = matchInfo?.hteamnameen
          const aName = matchInfo?.ateamnameen

          const invalid = typeof hName !== 'string' || typeof aName !== 'string'

          if (invalid) continue

          const home = hName.trim()
          const away = aName.trim()

          const league_Viva88Bet = League_Viva88Bet.findOne({
            idLeague: matchInfo.leagueid
          }) as LeagueType
          if (!league_Viva88Bet) continue

          if (league_Viva88Bet && !league_Viva88Bet.league) continue

          if (
            typeof matchInfo?.hteamnameen !== 'string' ||
            typeof matchInfo?.ateamnameen !== 'string'
          )
            continue

          if (!existingEvent) {
            const newEvent = {
              idEvent: matchInfo.matchid,
              nameHome: home,
              nameAway: away,
              home: home.toUpperCase(),
              away: away.toUpperCase(),
              idLeague: matchInfo.leagueid,
              liveawayscore: matchInfo.liveawayscore ?? 0,
              livehomescore: matchInfo.livehomescore ?? 0,
              livetimer: Number(matchInfo.livetimer) ?? null,
              awayred: matchInfo.awayred ?? null,
              homered: matchInfo.homered ?? null,
              nameLeague: league_Viva88Bet.nameLeague,
              league: league_Viva88Bet.league,
              liveperiod: matchInfo.liveperiod ?? 1,
              isht: matchInfo.isht ? 'HT' : ''
            }
            EventViva88.create(newEvent)
          } else {
            const updateFields: Record<string, any> = {}

            updateFields.score = `${matchInfo.livehomescore ?? existingEvent.livehomescore}-${matchInfo.liveawayscore ?? existingEvent.liveawayscore}`

            matchInfo.liveperiod ??= existingEvent.liveperiod ?? 0
            if (matchInfo.isht === 'HT' || matchInfo.isht) {
              updateFields.stat = 'HT'
            } else {
              updateFields.stat =
                getElapsedTime(
                  matchInfo.livetimer ?? existingEvent.livetimer,
                  matchInfo.liveperiod,
                  gameType
                ) ?? ''
            }

            if (matchInfo.awayred !== undefined) updateFields.awayred = matchInfo.awayred
            if (matchInfo.homered !== undefined) updateFields.homered = matchInfo.homered

            if (Object.keys(updateFields).length > 0) {
              await Viva88Bet.updateMany({ idEvent: matchInfo.matchid }, updateFields)
            }
          }
        }
        if (row[1] === 'o') {
          const matchInfo: Record<string, any> = {}
          for (let i = 0; i < row.length; i += 2) {
            const key = row[i]
            const value = row[i + 1]
            const matchKey = Object.keys(finalAbsoluteMap).find((k) => finalAbsoluteMap[k] == key)
            if (matchKey) {
              matchInfo[matchKey] = value
            }
          }

          let leagueid = matchInfo?.leagueid ?? 0

          const getLeagueid = (await EventViva88.findOne({ idEvent: matchInfo.matchid })) as any

          if (getLeagueid) {
            leagueid = getLeagueid.idLeague
            matchInfo.hteamnameen = getLeagueid.nameHome ?? matchInfo.hteamnameen
            matchInfo.ateamnameen = getLeagueid.nameAway ?? matchInfo.ateamnameen
            matchInfo.leagueid = getLeagueid.idLeague ?? matchInfo.leagueid
            matchInfo.league = getLeagueid.league
            matchInfo.home = getLeagueid.home
            matchInfo.away = getLeagueid.away
            matchInfo.livetimer = matchInfo?.livetimer ?? getLeagueid?.livetimer
            matchInfo.liveperiod = matchInfo?.liveperiod ?? getLeagueid?.liveperiod
            matchInfo.awayred = matchInfo?.awayred ?? getLeagueid?.awayred
            matchInfo.homered = matchInfo?.homered ?? getLeagueid?.homered
            matchInfo.livehomescore = matchInfo?.livehomescore ?? getLeagueid?.livehomescore
            matchInfo.liveawayscore = matchInfo?.liveawayscore ?? getLeagueid?.liveawayscore
          }

          if (leagueid === 0 && matchInfo.oddsid) {
            const findTicketL = (await Viva88Bet.findOne({
              altLineId: matchInfo.oddsid
            })) as any

            leagueid = findTicketL?.idLeague ?? 0
            if (findTicketL) {
              matchInfo.livetimer = matchInfo.livetimer ?? findTicketL.livetimer
              matchInfo.liveperiod = matchInfo.liveperiod ?? findTicketL.liveperiod
              matchInfo.awayred = matchInfo.awayred ?? findTicketL.awayred
              matchInfo.homered = matchInfo.homered ?? findTicketL.homered
            }
          }

          let findLeague: LeagueType | undefined = undefined

          if (leagueid) {
            findLeague = (await League_Viva88Bet.findOne({
              idLeague: leagueid
            })) as LeagueType
          }

          const findTicket = Viva88Bet.findOne({
            altLineId: matchInfo?.oddsid
          }) as DataCrawlType

          if (matchInfo?.matchid || matchInfo?.oddsid) {
            if (!findTicket) {
              let checkNumber =
                matchInfo.parenttypeid === 1 ||
                matchInfo.parenttypeid === 3 ||
                matchInfo.parenttypeid === 7
                  ? 0
                  : 1

              if (checkNumber === 0 && matchInfo.parenttypeid === 7 && matchInfo.bettype === 7) {
                checkNumber = 1
              }
              const dataSave = {
                platform: 'Viva88Bet',
                idLeague: leagueid ?? matchInfo?.leagueid ?? '',
                nameLeague: findLeague?.nameLeague ?? matchInfo?.league ?? '',
                idEvent: matchInfo.matchid,
                nameHome: matchInfo.hteamnameen,
                nameAway: matchInfo.ateamnameen,
                number: checkNumber,
                altLineId: matchInfo.oddsid,
                hdp_point:
                  matchInfo.parenttypeid === 1 || matchInfo.parenttypeid === 7
                    ? matchInfo.hdp1 !== 0
                      ? -matchInfo.hdp1
                      : matchInfo.hdp2
                    : matchInfo.hdp1 !== 0
                      ? matchInfo.hdp1
                      : -matchInfo.hdp1,
                home_over: matchInfo.odds1a,
                away_under: matchInfo.odds2a,
                redCard: `${matchInfo.homered ?? 0}-${matchInfo.awayred ?? 0}`,
                score: `${matchInfo.livehomescore ?? 0}-${matchInfo.liveawayscore ?? 0}`,
                stat: getElapsedTime(matchInfo.livetimer, matchInfo.liveperiod, gameType) ?? '',
                typeOdd:
                  matchInfo.parenttypeid === 1 || matchInfo.parenttypeid === 7 ? SPREAD : TOTAL,
                type: matchInfo.parenttypeid === 1 || matchInfo.parenttypeid === 7 ? 'HDP' : 'OU',
                bettype: matchInfo.bettype ?? '',
                HDP: CONVERT_HDP[
                  toPositiveNumber(
                    Math.abs(
                      matchInfo.parenttypeid === 1 || matchInfo.parenttypeid === 7
                        ? matchInfo.hdp1 !== 0
                          ? -matchInfo.hdp1
                          : matchInfo.hdp2
                        : matchInfo.hdp1 !== 0
                          ? matchInfo.hdp1
                          : -matchInfo.hdp1
                    )
                  )
                ],
                specialOdd: null,
                league: matchInfo.league,
                home: matchInfo.home,
                away: matchInfo.away
              }

              const requiredFields = [
                'idLeague',
                'nameLeague',
                'idEvent',
                'nameHome',
                'nameAway',
                'altLineId',
                'hdp_point',
                'home_over',
                'away_under'
              ]

              const isComplete = requiredFields.every(
                (key) => dataSave[key] !== undefined && dataSave[key] !== null
              )

              if (isComplete) {
                records.push(dataSave)
                if (records.length >= BATCH_SIZE) {
                  insertRecords(records, Viva88Bet)
                }
              }
            } else {
              if (matchInfo) {
                const updateFields: Record<string, any> = {}

                if (
                  matchInfo.hdp1 !== undefined &&
                  matchInfo.hdp2 !== undefined &&
                  matchInfo.parenttypeid !== undefined
                ) {
                  updateFields.hdp_point =
                    matchInfo.parenttypeid === 1 || matchInfo.parenttypeid === 7
                      ? matchInfo.hdp1 !== 0
                        ? -matchInfo.hdp1
                        : matchInfo.hdp2
                      : matchInfo.hdp1 !== 0
                        ? matchInfo.hdp1
                        : -matchInfo.hdp1
                }

                if (matchInfo.odds1a !== undefined) {
                  updateFields.home_over = matchInfo.odds1a
                }
                if (matchInfo.odds2a !== undefined) {
                  updateFields.away_under = matchInfo.odds2a
                }

                // Nếu có ít nhất một field để update
                if (Object.keys(updateFields).length > 0) {
                  Viva88Bet.update({ id: findTicket.id }, updateFields)
                }
              }
            }

            if (records.length > 0) {
              insertRecords(records, Viva88Bet)
            }
          }
        }

        if (Array.isArray(row) && row[1] === '-o') {
          Viva88Bet.delete({
            altLineId: row[3]
          })
        }

        if (Array.isArray(row) && row[1] === '-m') {
          EventViva88.delete({
            idEvent: row[3]
          })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}
function getElapsedTime(kickoffTimestamp, liveperiod, gameType) {
  const now = Date.now()

  const kickoff = kickoffTimestamp * 1000

  const diffMs = Math.floor(now - kickoff)
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 0 || gameType === 'Early') return ''
  const minutes = diffMinutes % 60
  if (liveperiod === 1) return `1H ${minutes}'`

  if (liveperiod === 2) return `2H ${minutes}'`
  return `1H ${minutes}'`
}

function insertRecords(records: any, Viva88Bet: Model) {
  // for (const record of records) {
  Viva88Bet.insertMany(records)
  // }
  records.length = 0
  // records.length = 0
}

function createReverseMap(obj: Record<string, number>): Record<number, string> {
  const reverse: Record<number, string> = {}
  for (const key in obj) {
    reverse[obj[key]] = key
  }
  return reverse
}
