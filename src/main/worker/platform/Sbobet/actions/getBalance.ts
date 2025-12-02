import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch, { Response } from 'node-fetch'

import { AccountType } from '@shared/common/types'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'

/**
 * Build HTTP headers for Sbobet API
 */
function buildHeaders(account: AccountType, cookieString?: string) {
  return {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    Connection: 'keep-alive',
    Cookie: cookieString ?? account.cookie,
    Referer: account.host,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
  }
}

/**
 * Safely parse response JSON or return error
 */
async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    try {
      return { data: await response.json(), ok: true }
    } catch {
      return { error: { Data: 'Error parsing JSON', ErrorCode: -5 }, ok: false }
    }
  }

  const text = await response.text()
  return { error: { Data: `Invalid JSON response: ${text}`, ErrorCode: -4 }, ok: false }
}

export async function getBalanceSbobet(account: AccountType, cookieString?: string) {
  const { status, data } = isProxyConfigValid(account)

  const proxyUrl =
    status && account.proxyScope !== 'None'
      ? `http://${data.newUsername}:${data.newPassword}@${data.newIpAddress}:${data.newPort}`
      : undefined

  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  try {
    const headers = buildHeaders(account, cookieString)
    const response = await fetch('https://api-home.sbobet.com/api/user/GetBalance', {
      headers,
      method: 'POST',
      ...(proxyAgent && { agent: proxyAgent })
    })

    const parsed = await parseResponse(response)
    if (!parsed.ok) return parsed.error

    const result = parsed.data

    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Response AccountBalance: ${JSON.stringify(result)}`,
      'Program'
    )

    if (result.error === 'MULTIPLE_LOGIN') {
      return { Data: 'Another session logged in. Forced to logout.', ErrorCode: 106 }
    }
    if (!('betCredit' in result)) {
      return { Data: `Not betCredit response: ${JSON.stringify(result)}`, ErrorCode: 107 }
    }

    return { Data: result.betCredit, ErrorCode: 0 }
  } catch (error) {
    console.error('Error fetching account-balance Sbobet:', error)

    if (
      error instanceof Error &&
      error.message.includes(
        'Client network socket disconnected before secure TLS connection was established'
      )
    ) {
      return {
        Data: 'Error: TLS connection could not be established (proxy/network issue)',
        ErrorCode: -2
      }
    }

    return {
      Data: `Error Res Balance: ${
        error instanceof Error ? error.message : 'Unstable network, proxy or server-side issue.'
      }`,
      ErrorCode: -1
    }
  }
}
