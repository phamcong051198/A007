import { Account } from '@db/model'

import { AccountType } from '@shared/common/types'
import { STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

import { accountLogToFile, flushLogQueue } from '@/worker/lib/accountLogToFile'

export function terminateWorker() {
  process.exit(0)
}

export async function exitWithLog(
  port: import('worker_threads').MessagePort,
  account: AccountType,
  textLog: string,
  statusLogin = STATUS_LOGIN.FAIL,
  status = STATUS_ACCOUNT.EXIT
) {
  port.postMessage({
    data: Account.update({ id: account.id }, { status, statusLogin, textLog }),
    type: 'DataUpdateAccount'
  })
  await accountLogToFile(account.platformName, account.loginID, textLog, 'Program')
  await flushLogQueue(account.platformName, account.loginID, 'Program') // <- chờ ghi xong

  terminateWorker()
}
