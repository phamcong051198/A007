import { Account, BetListResult } from '@db/model'
import type { MessagePort } from 'worker_threads'

import { AccountSettingType, TicketInfoDataBetType } from '@shared/common/types'
import { AccountType, DataPairPlatformType } from '@shared/common/types'

import { checkBetLimit } from '@/worker/lib/checkBetLimit'
import { formatTime } from '@/worker/lib/formatTime'

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
      isTicketBetFlags: [number, number]
    }
  | { valid: false; fieldError: string }
> {
  const baseQuery = {
    status: 'Logout',
    statusDelete: 0,
    statusLogin: 'Success',
    statusPair: 1
  }

  const [account1Info, account2Info] = await Promise.all([
    Account.findOne({ ...baseQuery, id: parsedAccount1.id }) as AccountType,
    Account.findOne({ ...baseQuery, id: parsedAccount2.id }) as AccountType
  ])

  if (!account1Info || !account2Info) return { fieldError: 'ErrAccNotExist', valid: false }

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
      info: messageFn({ info, setting, ticket }),
      receiptID: '',
      receiptStatus: '',
      time: formatTime()
    }))
    const recordDB = BetListResult.create({ dataPair: JSON.stringify(ticketUpdate) })
    port?.postMessage({ recordDB, type: 'BetList' })
  }

  if (accounts.some((acc) => acc.info.checkBoxBet == 0)) {
    sendFail((acc) =>
      acc.info.checkBoxBet == 0
        ? `Get Ticket Failed: Account ${acc.info.platformName}-${acc.info.loginID} setting input checkbox not Bet!`
        : 'Get Ticket Failed: Stop ticketing!'
    )
    return { fieldError: 'Checkbox account not bet', valid: false }
  }

  if (accounts.some((acc) => acc.setting.bet === 0))
    return { fieldError: 'Checkbox setting not bet', valid: false }

  if (!(await checkBetLimit(dataTicket, [account1Info, account2Info], port)))
    return { fieldError: 'Bet Limit', valid: false }

  const isBetAmountExceedsCredit = accounts.some(
    (acc) => Number(acc.ticket.stake) > Number(acc.info.credit)
  )
  if (isBetAmountExceedsCredit) {
    sendFail((acc) =>
      Number(acc.setting.betAmount) > Number(acc.info.credit)
        ? `Get Ticket Failed: Account ${acc.info.platformName}-${acc.info.loginID} insufficient credit (${acc.setting.betAmount} > ${acc.info.credit})!`
        : 'Get Ticket Failed: Do not have any available account for betting!'
    )
    return { fieldError: 'Insufficient credit', valid: false }
  }

  const isTicketBetFlags: [number, number] = [1, 1]

  return {
    accounts,
    isTicketBetFlags,
    valid: true
  }
}
