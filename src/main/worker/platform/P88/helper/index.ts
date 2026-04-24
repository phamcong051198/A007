import fetch from 'node-fetch'

import { AccountType } from '@shared/common/types'

export function buildPlatformUrl(account: AccountType, type: string) {
  const timestamp = Date.now()
  const url = account.loginURL

  const urlMap = {
    AUTH: `${url}member-auth/v2/auth?locale=en_US&_=${timestamp}&withCredentials=true`,
    BALANCE: `${url}member-service/v2/account-balance?locale=en_US&_=${timestamp}&withCredentials=true`,
    KEEP_ALIVE: `${url}member-auth/v2/keep-alive?locale=en_US&_=${timestamp}&withCredentials=true`,
    MULTI_TICKET: `${url}member-betslip/v2/all-odds-selections?locale=en_US&_=${timestamp}&withCredentials=true`,
    WAGER: `${url}member-service/v2/wager-filter?locale=en_US&_=${timestamp}&withCredentials=true`
  }

  return urlMap[type] ?? url
}

export async function parseLoginResponse(res: fetch.Response): Promise<{
  status: 'success' | 'expired' | 'fail' | 'blocked' | 'unknown'
  message: string
}> {
  const raw = await res.text()
  let parsed

  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = raw.trim()
  }

  if (typeof parsed === 'object' && parsed !== null && 'code' in parsed) {
    const { code, tokens } = parsed as { code?: number; tokens?: unknown }

    if (code === 1 && tokens) {
      return { message: 'Login success', status: 'success' }
    }

    if (code === 2 && tokens) {
      return {
        message: 'Account password has expired. Please update it on website.',
        status: 'expired'
      }
    }
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
