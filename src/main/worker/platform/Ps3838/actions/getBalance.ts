import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { AccountType } from '@shared/common/types'
import { OPTIONS_PROXY } from '@shared/main/constants'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { buildPlatformUrl } from '@/worker/platform/P88/helper'
import { buildHeadersPs3838 } from '@/worker/platform/Ps3838/common/contants'

export const getBalancePs3838 = async (account: AccountType) => {
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
    status && account.proxyScope !== OPTIONS_PROXY.NONE
      ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
      : undefined

  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  try {
    const res = await fetch(buildPlatformUrl(account, 'BALANCE'), {
      headers: {
        ...buildHeadersPs3838(account),
        Cookie: cookie,
        'x-browser-session-id': objectCookie.BrowserSessionId,
        'x-custid': objectCookie.custid,
        'x-lcu': objectCookie.lcu,
        'x-slid': objectCookie.SLID,
        'x-u': objectCookie.u,
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      method: 'GET',
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
      return { Data: 'Another session logged in. Forced to logout.', ErrorCode: 106 }
    }

    if (!('betCredit' in resData)) {
      return { Data: 'EXCEPTION in DoSpiderTask: Account has been logged out.', ErrorCode: 107 }
    }

    return { Data: String(resData.betCredit), ErrorCode: 0 }
  } catch (error) {
    console.error('Error fetching account-balance P88:', error)

    if (
      error instanceof Error &&
      error.message.includes(
        'Client network socket disconnected before secure TLS connection was established'
      )
    ) {
      return {
        Data: `Error: Client network socket disconnected before secure TLS connection was established`,
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
