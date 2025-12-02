/* eslint-disable @typescript-eslint/no-explicit-any */
import { TicketInfoDataBetType } from '@shared/common/types'
import { AccountType } from '@shared/common/types'

import { CreatePerMatchLimit } from '@/worker/lib/createPerMatchLimit'

export const UpdatePerMatchLimit = (account: AccountType, Ticket: TicketInfoDataBetType) => {
  try {
    CreatePerMatchLimit(account.id, Ticket)
  } catch (error) {
    console.log('Error UpdatePerMatchLimit', error)
  }
}
