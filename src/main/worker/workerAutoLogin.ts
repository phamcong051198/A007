import { Account } from '@db/model'
import { AccountType } from '@shared/common/types'
import { parentPort } from 'worker_threads'

const port = parentPort
if (!port) throw new Error('IllegalState')

//300 = 5 phut x 60

const numberDelay = 120

setInterval(() => {
  const listAccount = Account.findAll({
    status: 'Exit',
    checkBoxAutoLogin: 1,
    statusDelete: 0
  }) as AccountType[]

  if (listAccount.length) {
    port.postMessage(listAccount)
  }
}, numberDelay * 1000)
