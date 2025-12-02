import { MessagePort } from 'worker_threads'

import { Account } from '@db/model'
import fetch from 'node-fetch'

import { AccountType } from '@shared/common/types'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'

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
    return { message: 'Login success', status: 'success' }
  }
  if (parsed === 0 || parsed === '0') {
    return { message: 'Invalid loginId or password', status: 'fail' }
  }
  if (typeof parsed === 'string' && parsed.includes('Cloudflare')) {
    return { message: 'Blocked by Cloudflare (Error 1015)', status: 'blocked' }
  }
  return { message: 'Unknown response format', status: 'unknown' }
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
    data: Account.update({ id: account.id }, { textLog }),
    type: 'DataUpdateAccount'
  })
}

export async function handleLoginFail(port: MessagePort, account: AccountType, textLog: string) {
  port.postMessage({
    data: Account.update(
      { id: account.id },
      {
        status: 'Exit',
        statusLogin: 'Fail',
        textLog
      }
    ),
    type: 'DataUpdateAccount'
  })
  await accountLogToFile(account.platformName, account.loginID, `Error: ${textLog}`, 'Program')
}
