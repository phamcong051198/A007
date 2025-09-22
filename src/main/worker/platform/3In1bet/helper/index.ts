import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { Account } from '@db/model'
import { STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'
import { AccountType } from '@shared/common/types'

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
    type: 'DataUpdateAccount',
    data: Account.update({ id: account.id }, { textLog, statusLogin, status })
  })
  await accountLogToFile(account.platformName, account.loginID, textLog, 'Program')
  terminateWorker()
}

export function mergeCookies(oldCookies: string, setCookieHeader: string | null) {
  const cookieMap = new Map<string, string>()

  if (oldCookies) {
    oldCookies.split(';').forEach((c) => {
      const [k, ...rest] = c.trim().split('=')
      if (!k) return
      cookieMap.set(k, rest.join('='))
    })
  }

  if (setCookieHeader) {
    setCookieHeader.split(/,(?=\s*\w+=)/).forEach((raw) => {
      const [pair] = raw.split(';')
      const [k, ...rest] = pair.trim().split('=')
      cookieMap.set(k, rest.join('='))
    })
  }

  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

export function createPayload(gameType) {
  const fcMap = {
    Early: '6',
    Today: '1',
    Running: '4'
  }

  return {
    fc: fcMap[gameType],
    m_accType: 'MY+MR',
    SystemLanguage: 'en-US',
    TimeFilter: '0',
    m_gameType: 'S_',
    m_SortByTime: '0',
    m_LeagueList: '',
    SingleDouble: 'double',
    clientTime: '',
    c: 'A',
    fav: '',
    exlist: '0',
    keywords: '',
    m_sp: '0'
  }
}

export function isArError(res: unknown): res is { Au: number } {
  return typeof res === 'object' && res !== null && 'Au' in res
}
