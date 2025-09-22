import { calculateBetAmountStd } from '@/worker/lib/calculateBetAmountStd'
import { checkBetLimit } from '@/worker/lib/checkBetLimit'
import { formatTime } from '@/worker/lib/formatTime'
import { getRandomBetAmountValue } from '@/worker/lib/getRandomBetAmountValue'
import { getRandomValue } from '@/worker/lib/getRandomValue'
import { isOddInRange } from '@/worker/lib/isOddInRange'
import { isTicketBet } from '@/worker/lib/isTicketBet'
import { Account, BetListResult, Setting } from '@db/model'
import { AccountSettingType, TicketInfoDataBetType } from '@shared/common/types'
import { AccountType, DataPairPlatformType, SettingType } from '@shared/common/types'
import type { MessagePort } from 'worker_threads'

type AccountInfo = {
  info: AccountType
  setting: AccountSettingType
  ticket: DataPairPlatformType | TicketInfoDataBetType
}

export async function validateSettingAccountPairBeforeBet(
  parsedAccount1: AccountSettingType,
  parsedAccount2: AccountSettingType,
  dataTicket: DataPairPlatformType[] | TicketInfoDataBetType[],
  port: MessagePort,
  gameType: string
): Promise<
  | {
      valid: true
      accounts: AccountInfo[]
      betAmountStandardValid: string[]
      isTicketBetFlags: [number, number]
    }
  | { valid: false; fieldError: string }
> {
  const baseQuery = {
    status: 'Logout',
    statusLogin: 'Success',
    statusDelete: 0,
    statusPair: 1
  }

  const [account1Info, account2Info] = await Promise.all([
    Account.findOne({ ...baseQuery, id: parsedAccount1.id }) as AccountType,
    Account.findOne({ ...baseQuery, id: parsedAccount2.id }) as AccountType
  ])

  if (!account1Info || !account2Info) return { valid: false, fieldError: 'ErrAccNotExist' }

  const [TicketI, TicketII] = dataTicket
  const accounts = [
    { info: account1Info, setting: parsedAccount1, ticket: TicketI },
    { info: account2Info, setting: parsedAccount2, ticket: TicketII }
  ]

  const sendFail = (messageFn: (acc: (typeof accounts)[0]) => string) => {
    const ticketUpdate = accounts.map(({ info, setting, ticket }) => ({
      ...ticket,
      company: `${info.platformName}-${info.loginID}`,
      coverage: ticket.number === 0 ? 'FT' : 'FirstHalf',
      gameType,
      time: formatTime(),
      info: messageFn({ info, setting, ticket }),
      receiptID: '',
      receiptStatus: ''
    }))
    const recordDB = BetListResult.create({ dataPair: JSON.stringify(ticketUpdate) })
    port?.postMessage({ type: 'BetList', recordDB })
  }

  if (accounts.some((acc) => acc.info.checkBoxBet == 0)) {
    sendFail((acc) =>
      acc.info.checkBoxBet == 0
        ? `Get Ticket Failed: Account ${acc.info.platformName}-${acc.info.loginID} setting input checkbox not Bet!`
        : 'Get Ticket Failed: Stop ticketing!'
    )
    return { valid: false, fieldError: 'Checkbox account not bet' }
  }

  if (accounts.some((acc) => acc.setting.bet === 0))
    return { valid: false, fieldError: 'Checkbox setting not bet' }

  if (!(await checkBetLimit(dataTicket, [account1Info, account2Info], port)))
    return { valid: false, fieldError: 'Bet Limit' }

  const hasBetAmount = accounts.some(
    (acc) => Number(acc.setting.betAmount) === 0 && acc.setting.generalSetting !== 'NoBet'
  )
  const hasBetAmountZero = accounts.every((acc) => Number(acc.setting.betAmount) === 0)

  if (hasBetAmount || hasBetAmountZero) {
    sendFail((acc) =>
      Number(acc.setting.betAmount) === 0
        ? `Get Ticket Failed: Account ${acc.info.platformName}-${acc.info.loginID} setting bet amount 0!`
        : 'Get Ticket Failed: Do not have any available account for betting!'
    )
    return { valid: false, fieldError: 'Setting bet amount 0' }
  }

  const isBetAmountExceedsCredit = accounts.some(
    (acc) => Number(acc.setting.betAmount) > Number(acc.info.credit)
  )
  if (isBetAmountExceedsCredit) {
    sendFail((acc) =>
      Number(acc.setting.betAmount) > Number(acc.info.credit)
        ? `Get Ticket Failed: Account ${acc.info.platformName}-${acc.info.loginID} insufficient credit (${acc.setting.betAmount} > ${acc.info.credit})!`
        : 'Get Ticket Failed: Do not have any available account for betting!'
    )
    return { valid: false, fieldError: 'Insufficient credit' }
  }

  const isCheckOddAccountPair = accounts.some((acc) => acc.setting.checkOdd)
  if (isCheckOddAccountPair) {
    const invalidAccounts = accounts.filter(
      ({ setting, ticket }) => !isOddInRange(setting.oddFrom, setting.oddTo, String(ticket.odd))
    )

    if (invalidAccounts.length > 0) {
      sendFail((acc) => {
        const odd = String(acc.ticket.odd)
        const isValid = isOddInRange(acc.setting.oddFrom, acc.setting.oddTo, odd)
        return isValid
          ? 'Get Ticket Failed: Do not have any available for betting!'
          : `Get Ticket Failed: Account ${acc.info.platformName}-${acc.info.loginID} odds ${odd} is out of range!`
      })
      return { valid: false, fieldError: 'Odd out of range' }
    }
  }

  const isNoBetAccountPair = accounts.every((acc) => acc.setting.generalSetting == 'NoBet')
  if (isNoBetAccountPair) {
    sendFail(
      (acc) =>
        `Get Ticket Failed: Account ${acc.info.platformName}-${acc.info.loginID} setting select ${acc.setting.generalSetting}!`
    )
    return { valid: false, fieldError: 'Setting select NoBet' }
  }

  const isTicketBetFlags: [number, number] = [1, 1]
  const isCheckBetSelected = accounts.some(
    ({ setting }) => setting.generalSetting === 'BetSelected'
  )
  if (isCheckBetSelected) {
    const statusBets = accounts.map((acc) => isTicketBet(acc, gameType))
    if (!statusBets[0] && !statusBets[1])
      return { valid: false, fieldError: ' Setting select is not bet range' }
    if (!statusBets[0]) isTicketBetFlags[0] = 0
    if (!statusBets[1]) isTicketBetFlags[1] = 0
  }

  const settingApp = Setting.findAll() as SettingType[]
  const betAmountStandardValid = accounts.map(({ setting }) => {
    let betAmount = setting.betAmount
    const { rounder, roundValue, roundType } = setting.amountRounderSetting

    if (rounder) {
      betAmount = String(calculateBetAmountStd(betAmount, Number(roundValue), roundType))
    }

    if (settingApp[0].amountRoundingEnabled) {
      betAmount = String(
        calculateBetAmountStd(
          betAmount,
          Number(settingApp[0].roundingNumber),
          settingApp[0].roundType
        )
      )
    }

    if (settingApp[0].enableRandomizer) {
      const randomValue = getRandomValue(
        Number(betAmount),
        getRandomBetAmountValue(
          Number(settingApp[0].fromRandomizer),
          Number(settingApp[0].toRandomizer)
        )
      )
      if (randomValue !== 0) {
        betAmount = String(randomValue)
      }
    }

    return betAmount
  })

  const isInvalidCredit = betAmountStandardValid.some(
    (amount, idx) => Number(amount) > Number(accounts[idx].info.credit)
  )
  if (isInvalidCredit) return { valid: false, fieldError: 'Setting BetAmount > Credit' }

  return {
    valid: true,
    accounts,
    betAmountStandardValid,
    isTicketBetFlags
  }
}
