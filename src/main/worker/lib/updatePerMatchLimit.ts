/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreatePerMatchLimit } from '@/worker/lib/createPerMatchLimit'
import { CreatePerMatchLimitPlatform } from '@/worker/lib/createPerMatchLimitPlatform'
import { PerMatchLimitPlatform } from '@db/model'
import { PerMatchLimitPlatformType } from '@db/schema/perMatchLimitPlatform'
import { TicketInfoDataBetType } from '@shared/common/types'
import { AccountType } from '@shared/common/types'

export const UpdatePerMatchLimit = (account: AccountType, Ticket: TicketInfoDataBetType) => {
  try {
    const { id: idAccount, platformName } = account
    const { league = '', home = '', away = '', betAmount_Standard } = Ticket

    const updateLimit = (
      Model: any,
      query: Record<string, any>,
      existingLimit: PerMatchLimitPlatformType
    ) => {
      Model.update(query, {
        countCurrent: (Number(existingLimit.countCurrent) + 1).toString(),
        amountCurrent: (Number(existingLimit.amountCurrent) + Number(betAmount_Standard)).toString()
      })
    }

    // Cập nhật PerMatchLimit
    CreatePerMatchLimit(idAccount, Ticket)

    // Cập nhật PerMatchLimitPlatform
    const perMatchLimitPlatform = PerMatchLimitPlatform.findOne({
      league,
      home,
      away,
      platform: platformName
    }) as PerMatchLimitPlatformType

    if (perMatchLimitPlatform) {
      updateLimit(
        PerMatchLimitPlatform,
        { league, home, away, platform: platformName },
        perMatchLimitPlatform
      )
    } else {
      CreatePerMatchLimitPlatform(account, Ticket)
    }
  } catch (error) {
    console.log('Error UpdatePerMatchLimit', error)
  }
}
