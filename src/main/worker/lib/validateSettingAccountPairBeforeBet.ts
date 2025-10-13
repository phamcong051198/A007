import { checkBetLimit } from '@/worker/lib/checkBetLimit'
import { formatTime } from '@/worker/lib/formatTime'
import { Account, BetListResult } from '@db/model'
import { AccountSettingType, TicketInfoDataBetType } from '@shared/common/types'
import { AccountType, DataPairPlatformType } from '@shared/common/types'
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

  const isBetAmountExceedsCredit = accounts.some(
    (acc) => Number(acc.ticket.stake) > Number(acc.info.credit)
  )
  if (isBetAmountExceedsCredit) {
    sendFail((acc) =>
      Number(acc.setting.betAmount) > Number(acc.info.credit)
        ? `Get Ticket Failed: Account ${acc.info.platformName}-${acc.info.loginID} insufficient credit (${acc.setting.betAmount} > ${acc.info.credit})!`
        : 'Get Ticket Failed: Do not have any available account for betting!'
    )
    return { valid: false, fieldError: 'Insufficient credit' }
  }

  const isTicketBetFlags: [number, number] = [1, 1]

  return {
    valid: true,
    accounts,
    isTicketBetFlags
  }
}
