import fetch from 'node-fetch'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { Account } from '@db/model'
import { AccountType } from '@shared/common/types'
import { MessagePort } from 'worker_threads'

export async function parseLoginResponse(res: fetch.Response): Promise<{
  status: 'success' | 'fail' | 'blocked' | 'unknown'
  message: string
}> {
  const raw = await res.text()
  let parsed

  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = raw.trim()
  }

  if (typeof parsed === 'object' && parsed?.code === 1 && parsed.tokens) {
    return { status: 'success', message: 'Login success' }
  }
  if (parsed === 0 || parsed === '0') {
    return { status: 'fail', message: 'Invalid loginId or password' }
  }
  if (typeof parsed === 'string' && parsed.includes('Cloudflare')) {
    return { status: 'blocked', message: 'Blocked by Cloudflare (Error 1015)' }
  }
  return { status: 'unknown', message: 'Unknown response format' }
}

export function extractCookie(setCookieHeader: string | null): string {
  if (!setCookieHeader) return ''
  return setCookieHeader
    .split(',')
    .map((c) => c.split(';')[0])
    .join('; ')
}

export async function updateAccountStatus(
  port: MessagePort,
  account: AccountType,
  textLog: string
) {
  port.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update({ id: account.id }, { textLog })
  })
}

export async function handleLoginFail(port: MessagePort, account: AccountType, textLog: string) {
  port.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        status: 'Exit',
        statusLogin: 'Fail',
        textLog
      }
    )
  })
  await accountLogToFile(account.platformName, account.loginID, `Error: ${textLog}`, 'Program')
}
