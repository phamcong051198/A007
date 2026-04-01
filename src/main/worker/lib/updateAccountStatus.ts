import { MessagePort } from 'worker_threads'

import { Account } from '@db/model'

import { AccountType } from '@shared/common/types'

export async function updateAccountStatus(
  port: MessagePort,
  account: AccountType,
  textLog: string
) {
  port.postMessage({
    data: Account.update({ id: account.id }, { textLog }),
    type: 'DataUpdateAccount'
  })
}
