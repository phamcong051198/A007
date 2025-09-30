/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreatePerMatchLimit } from '@/worker/lib/createPerMatchLimit'
import { TicketInfoDataBetType } from '@shared/common/types'
import { AccountType } from '@shared/common/types'

export const UpdatePerMatchLimit = (account: AccountType, Ticket: TicketInfoDataBetType) => {
  try {
    CreatePerMatchLimit(account.id, Ticket)
  } catch (error) {
    console.log('Error UpdatePerMatchLimit', error)
  }
}
