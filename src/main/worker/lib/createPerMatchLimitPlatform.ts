/* eslint-disable @typescript-eslint/no-explicit-any */
import { PerMatchLimitPlatform, SettingPerMatchLimit } from '@db/model'
import { TicketInfoDataBetType } from '@shared/common/types'
import { AccountType, SettingPerMatchLimitType } from '@shared/common/types'

export const CreatePerMatchLimitPlatform = (
  account: AccountType,
  Ticket: TicketInfoDataBetType
) => {
  const { platformName: platform } = account
  const { league = '', home = '', away = '' } = Ticket

  const createIfNotExists = (Model: any, query: Record<string, any>, createData: () => void) => {
    if (!Model.findOne(query)) {
      const data = createData()
      Model.create(data)
    }
  }

  createIfNotExists(PerMatchLimitPlatform, { league, home, away, platform }, () => {
    const setting = SettingPerMatchLimit.findOne({
      namePlatform: platform
    }) as SettingPerMatchLimitType
    return {
      league,
      home,
      away,
      platform,
      count: setting.totalCount,
      countCurrent: '1',
      amount: setting.totalAmount,
      amountCurrent: String(Ticket.betAmount_Standard)
    }
  })
}
