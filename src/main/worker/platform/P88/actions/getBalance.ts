import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { AccountType } from '@shared/common/types'
import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { API_ENDPOINTS, buildHeadersP88Bet } from '@/worker/platform/P88/common/contants'

export const getBalanceP88bet = async (account: AccountType) => {
  const { cookie } = account

  const objectCookie = cookie.split(';').reduce((acc, item) => {
    const [key, ...rest] = item.split('=').map((str) => str.trim())
    const value = rest.join('=')
    if (key) acc[key] = value
    return acc
  }, {}) as {
    BrowserSessionId: string
    custid: string
    lcu: string
    u: string
    SLID: string
  }

  const { status, data } = isProxyConfigValid(account)
  const { newIpAddress, newPort, newUsername, newPassword } = data

  const proxyUrl =
    status && account.proxyScope !== 'None'
      ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
      : undefined

  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  try {
    const res = await fetch(API_ENDPOINTS.BALANCE, {
      method: 'GET',
      headers: {
        ...buildHeadersP88Bet(account),
        'x-browser-session-id': objectCookie.BrowserSessionId,
        'x-custid': objectCookie.custid,
        'x-u': objectCookie.u,
        'x-slid': objectCookie.SLID,
        'x-lcu': objectCookie.lcu,
        Cookie: cookie,
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      ...(proxyAgent && { agent: proxyAgent })
    })

    const resData = await res.json()
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Response AccountBalance: ${JSON.stringify(resData)}`,
      'Program'
    )

    if (resData.error === 'MULTIPLE_LOGIN') {
      return { ErrorCode: 106, Data: 'Another session logged in. Forced to logout.' }
    }

    if (!('betCredit' in resData)) {
      return { ErrorCode: 107, Data: 'EXCEPTION in DoSpiderTask: Account has been logged out.' }
    }

    return { ErrorCode: 0, Data: String(resData.betCredit) }
  } catch (error) {
    console.error('Error fetching account-balance P88:', error)

    if (
      error instanceof Error &&
      error.message.includes(
        'Client network socket disconnected before secure TLS connection was established'
      )
    ) {
      return {
        ErrorCode: -2,
        Data: `Error: Client network socket disconnected before secure TLS connection was established`
      }
    }

    return {
      ErrorCode: -1,
      Data: `Error Res Balance: ${
        error instanceof Error ? error.message : 'Unstable network, proxy or server-side issue.'
      }`
    }
  }
}
