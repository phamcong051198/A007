/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-constant-condition */
const { parentPort, workerData } = require('worker_threads')

import { setTimeout } from 'timers/promises'

import { AccountPair, createModel, DataBet, PlatformPair, Setting } from '@db/model'
import { AccountPairDBType } from '@db/schema/accountPair'
import dataCrawlByPlatformSchema from '@db/schema/dataCrawlByPlatform'
import { PlatformPairType } from '@db/schema/platformPair'

import { GAME_TYPES } from '@shared/common/constants'
import { OVER, SPREAD, UNDER } from '@shared/common/constants'
import { DataCrawlType, SettingType } from '@shared/common/types'

import { calculateProfit } from '@/worker/lib/calculateProfit'
import { checkOddsSetting } from '@/worker/lib/checkOddsSetting'
import { clearTablesForGameType } from '@/worker/lib/clearTablesForGameType'
import { findMatchingData } from '@/worker/lib/findMatchingData'
import { generateTicketUpdate } from '@/worker/lib/generateTicketUpdate'
import { handleCombinationWithDataTicket } from '@/worker/lib/handleCombinationWithDataTicket'
import { isValidData } from '@/worker/lib/isValidData'

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
  const arrDataBet: { idAccountPair: string; dataPair: string }[][] = []

  for (const dataCrawlPlatform1 of listDataCrawlPlatform1) {
    if (!isHalfHandicap(dataCrawlPlatform1.hdp_point)) continue

    const settingInfo = Setting.findAll() as SettingType[]

    if (gameType !== settingInfo[0].gameType) {
      gameType = settingInfo[0].gameType
      clearTablesForGameType()
      return
    }

    if (settingInfo[0].enable == 1) return

    const { league, home, away, typeOdd, hdp_point, number } = dataCrawlPlatform1

    // Loại bỏ những trận có hiệp phụ (ViVa88 có (ET) ở cuối tên đội)
    if (dataCrawlPlatform1.nameHome.includes('(ET)')) continue

    if (!league || !home || !away) continue

    const listDataCrawlPlatform2 = Platform2_Model.findAll({
      hdp_point,
      league,
      number,
      typeOdd
    }) as DataCrawlType[]

    if (listDataCrawlPlatform2.length == 0) continue

    const dataCrawlPlatform2 = findMatchingData(listDataCrawlPlatform2, home, away)
    if (!dataCrawlPlatform2) continue

    // Loại bỏ những trận có hiệp phụ (ViVa88 có (ET) ở cuối tên đội)
    if (dataCrawlPlatform2.nameHome.includes('(ET)')) continue

    if (isValidData(dataCrawlPlatform2) == false) continue

    const profitCombos = [
      {
        bet1: dataCrawlPlatform1.typeOdd === SPREAD ? dataCrawlPlatform1.nameHome : OVER,
        bet2: dataCrawlPlatform2.typeOdd === SPREAD ? dataCrawlPlatform2.nameAway : UNDER,
        odd1: dataCrawlPlatform1.home_over,
        odd2: dataCrawlPlatform2.away_under
      },
      {
        bet1: dataCrawlPlatform1.typeOdd === SPREAD ? dataCrawlPlatform1.nameAway : UNDER,
        bet2: dataCrawlPlatform2.typeOdd === SPREAD ? dataCrawlPlatform2.nameHome : OVER,
        odd1: dataCrawlPlatform1.away_under,
        odd2: dataCrawlPlatform2.home_over
      }
    ]

    for (const { odd1, odd2, bet1, bet2 } of profitCombos) {
      const profitResult = calculateProfit(Number(odd1), Number(odd2))
      if (profitResult.status !== 'OK') continue

      const checkOdds = checkOddsSetting()

      const stat1 = dataCrawlPlatform1?.stat
      const stat2 = dataCrawlPlatform2?.stat

      // Nếu 1 trong 2 stat có 'ET' (Extra Time) => bỏ qua
      if ([stat1, stat2].some((stat) => stat?.includes('ET'))) continue

      const stat = stat1 ?? stat2
      const type = dataCrawlPlatform1?.type ?? dataCrawlPlatform2?.type

      const score =
        gameType === GAME_TYPES.RUNNING
          ? (dataCrawlPlatform1.score ?? dataCrawlPlatform2.score)
          : ''
      const redCard =
        gameType === GAME_TYPES.RUNNING
          ? (dataCrawlPlatform1.redCard ?? dataCrawlPlatform2.redCard)
          : ''

      const commonData = { redCard, score, stat, type }

      const dataTicketI = {
        ...dataCrawlPlatform1,
        ...commonData
      }
      const dataTicketII = {
        ...dataCrawlPlatform2,
        ...commonData
      }

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

      // const record = BetListResult.create({ dataPair: JSON.stringify(ticketUpdate) })
      // parentPort.postMessage({ type: 'BetList', recordDB: record })
      listDataPlatformPair.push(ticketUpdate)
    }
  }

  if (listDataPlatformPair.length === 0) return

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

/**
 * ✅ Kiểm tra kèo là half (0.5, 1.5, 2.5...) — bỏ quarter
 *
 */
function isHalfHandicap(value: string | number): boolean {
  const num = parseFloat(String(value))
  if (isNaN(num)) return false
  return Math.abs(num * 2) % 2 === 1 // chỉ nhận .5
}
