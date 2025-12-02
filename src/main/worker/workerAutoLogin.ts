import { parentPort } from 'worker_threads'

import { Account } from '@db/model'

import { AccountType } from '@shared/common/types'

const port = parentPort
if (!port) throw new Error('IllegalState')

//300 = 5 phut x 60

const numberDelay = 120

setInterval(() => {
  const listAccount = Account.findAll({
    checkBoxAutoLogin: 1,
    status: 'Exit',
    statusDelete: 0
  }) as AccountType[]

  if (listAccount.length) {
    port.postMessage(listAccount)
  }
}, numberDelay * 1000)
