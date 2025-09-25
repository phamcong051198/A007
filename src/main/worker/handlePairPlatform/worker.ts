/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-constant-condition */
const { parentPort, workerData } = require('worker_threads')
import { calculateProfit } from '@/worker/lib/calculateProfit'
import { checkOddsSetting } from '@/worker/lib/checkOddsSetting'
import { clearTablesForGameType } from '@/worker/lib/clearTablesForGameType'
import { generateTicketUpdate } from '@/worker/lib/generateTicketUpdate'
import { handleCombinationWithDataTicket } from '@/worker/lib/handleCombinationWithDataTicket'
import { isCheckNumberHalf } from '@/worker/lib/isCheckNumberHalf'
import { isValidData } from '@/worker/lib/isValidData'
import { AccountPair, BetListResult, createModel, DataBet, PlatformPair, Setting } from '@db/model'
import { AccountPairDBType } from '@db/schema/accountPair'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { PlatformPairType } from '@db/schema/platformPair'
import { GAME_TYPES } from '@shared/common/constants'
import { OVER, SPREAD, UNDER } from '@shared/common/constants'
import { DataCrawlType, SettingType } from '@shared/common/types'
import { setTimeout } from 'timers/promises'

let gameType: string | null = null
const key = workerData.pair as string

async function startWorking() {
  while (true) {
    const platformPair = PlatformPair.findOne({ key }) as PlatformPairType
    if (!platformPair) return

    await handleCombinationPlatform(platformPair)

    await setTimeout(1500)
  }
}

startWorking()

async function handleCombinationPlatform(platformPair: PlatformPairType) {
  const normalizePlatform = (platform) => {
    return platform === '3in1Bet' ? 'IIIin1Bet' : platform
  }

  const [Platform1_Model, Platform2_Model] = [
    createModel(normalizePlatform(platformPair.platform1), dataCrawlByPlatformSchema),
    createModel(normalizePlatform(platformPair.platform2), dataCrawlByPlatformSchema)
  ]

  const listDataCrawlPlatform1 = Platform1_Model.findAll() as DataCrawlType[]
  if (!listDataCrawlPlatform1.length) return

  const listDataPlatformPair: any[][] = []
  for (const dataCrawlPlatform1 of listDataCrawlPlatform1) {
    const settingInfo = Setting.findAll() as SettingType[]

    if (gameType !== settingInfo[0].gameType) {
      gameType = settingInfo[0].gameType
      clearTablesForGameType()
      return
    }
    const { league, home, away, typeOdd, hdp_point, number } = dataCrawlPlatform1
    if (!league || !home || !away) continue

    if (isValidData(dataCrawlPlatform1) == false) continue

    const dataCrawlPlatform2 = Platform2_Model.findOne({
      league,
      home,
      away,
      typeOdd,
      hdp_point,
      number
    }) as DataCrawlType

    if (!dataCrawlPlatform2) continue

    if (isValidData(dataCrawlPlatform2) == false) continue

    //[Setting] - Check General Setting (1st Half - 2nd Half)
    if (!isCheckNumberHalf(dataCrawlPlatform1, settingInfo[0])) continue

    const profitCombos = [
      {
        odd1: dataCrawlPlatform1.home_over,
        odd2: dataCrawlPlatform2.away_under,
        bet1: dataCrawlPlatform1.typeOdd === SPREAD ? dataCrawlPlatform1.nameHome : OVER,
        bet2: dataCrawlPlatform2.typeOdd === SPREAD ? dataCrawlPlatform2.nameAway : UNDER
      },
      {
        odd1: dataCrawlPlatform1.away_under,
        odd2: dataCrawlPlatform2.home_over,
        bet1: dataCrawlPlatform1.typeOdd === SPREAD ? dataCrawlPlatform1.nameAway : UNDER,
        bet2: dataCrawlPlatform2.typeOdd === SPREAD ? dataCrawlPlatform2.nameHome : OVER
      }
    ]

    for (const { odd1, odd2, bet1, bet2 } of profitCombos) {
      const profitResult = calculateProfit(Number(odd1), Number(odd2))
      if (profitResult.status !== 'OK') continue

      const checkOdds = checkOddsSetting(odd1, odd2, profitResult.profit)

      const score =
        gameType === GAME_TYPES.RUNNING
          ? (dataCrawlPlatform1.score ?? dataCrawlPlatform2.score)
          : ''
      const redCard =
        gameType === GAME_TYPES.RUNNING
          ? (dataCrawlPlatform1.redCard ?? dataCrawlPlatform2.redCard)
          : ''

      const stat = dataCrawlPlatform1.stat ?? dataCrawlPlatform2.stat
      const type = dataCrawlPlatform1.type ?? dataCrawlPlatform2.type

      const commonData = { score, redCard, stat, type }

      const dataTicketI = { ...dataCrawlPlatform1, ...commonData }
      const dataTicketII = { ...dataCrawlPlatform2, ...commonData }

      const ticketUpdate = generateTicketUpdate(
        dataTicketI,
        bet1,
        odd1,
        checkOdds.Data.infoOdd1,
        dataTicketII,
        bet2,
        odd2,
        checkOdds.Data.infoOdd2,
        profitResult.profit,
        settingInfo[0].gameType
      )
      if (checkOdds.ErrorCode !== 0) continue
      const record = BetListResult.create({ dataPair: JSON.stringify(ticketUpdate) })
      parentPort.postMessage({ type: 'BetList', recordDB: record })
      listDataPlatformPair.push(ticketUpdate)
    }
  }

  if (listDataPlatformPair.length === 0) return

  const arrDataBet: { idAccountPair: string; dataPair: string }[][] = []
  for (const dataPairPlatform of listDataPlatformPair) {
    const key = `${dataPairPlatform[0].platform}_${dataPairPlatform[1].platform}`
    const listAccountPair = AccountPair.findAll({ isValid: 1, key }) as AccountPairDBType[]
    if (!listAccountPair.length) continue

    for (const accountPair of listAccountPair) {
      try {
        const settingInfo = Setting.findAll() as SettingType[]
        if (gameType !== settingInfo[0].gameType) {
          gameType = settingInfo[0].gameType
          clearTablesForGameType()
          break
        }

        await handleCombinationWithDataTicket(
          arrDataBet,
          dataPairPlatform,
          accountPair,
          gameType,
          parentPort
        )
        if (arrDataBet.length && DataBet.count() < 50) {
          const settingInfo = Setting.findAll() as SettingType[]
          if (gameType !== settingInfo[0].gameType) {
            gameType = settingInfo[0].gameType
            clearTablesForGameType()
            return
          }
          DataBet.insertMany(arrDataBet.flat())
        }
        arrDataBet.length = 0
      } catch (error) {
        console.log('Error workerPairDataWithCombination', error)
      }
    }
  }

  listDataPlatformPair.length = 0
}
