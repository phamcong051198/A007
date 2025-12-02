import { BetToType } from '@shared/common/types'
import { AccountType } from '@shared/common/types'

const generateDetailSetting = () => {
  return {
    FT_Eat: 0,
    FT_Over: 0,
    FT_PK: 0,
    FT_Put: 0,
    FT_Under: 0,
    Half_Eat: 0,
    Half_Over: 0,
    Half_PK: 0,
    Half_Put: 0,
    Half_Under: 0,
    generalSetting: 'BetAll'
  }
}

const generateBetTo = () => {
  const betLevels = Array.from({ length: 89 }, (_, i) => i * 0.25)

  return {
    betAll: 1,
    selectAll: 0,
    ...Object.fromEntries(
      betLevels.map((level) => [`hdp_${level.toString().replace('.', '_')}`, 0])
    )
  } as BetToType
}

const generateGameRange = () => {
  return {
    allMinutes: 1,
    arrayMinutes: [],
    betAll: 1,
    checkOdd: 0,
    early: 1,
    oddFrom: '0.70',
    oddTo: '-0.01',
    running: 1,
    today: 1
  }
}

export function generateAccountData(account: AccountType) {
  return {
    amountRounderSetting: {
      roundType: 'auto',
      roundValue: '2',
      rounder: 0
    },
    bet: 1,
    betAmount: '100',

    checkOdd: 0,

    contra: 1,
    id: account.id,
    loginID: account.loginID,
    oddFrom: '0.01',
    oddTo: '-0.01',

    platform: account.platformName,
    ...generateDetailSetting(),

    FT_Eat_Detail: {
      betTo: generateBetTo(),
      range: generateGameRange()
    },

    FT_Over_Detail: {
      betTo: generateBetTo(),
      range: generateGameRange()
    },

    FT_PK_Detail: {
      range: generateGameRange()
    },

    FT_Put_Detail: {
      betTo: generateBetTo(),
      range: generateGameRange()
    },

    FT_Under_Detail: {
      betTo: generateBetTo(),
      range: generateGameRange()
    },

    Half_Eat_Detail: {
      betTo: generateBetTo(),
      range: generateGameRange()
    },

    Half_Over_Detail: {
      betTo: generateBetTo(),
      range: generateGameRange()
    },

    Half_PK_Detail: {
      range: generateGameRange()
    },

    Half_Put_Detail: {
      betTo: generateBetTo(),
      range: generateGameRange()
    },

    Half_Under_Detail: {
      betTo: generateBetTo(),
      range: generateGameRange()
    }
  }
}
