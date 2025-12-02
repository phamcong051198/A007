import { parentPort } from 'worker_threads'

import { Account, Setting } from '@db/model'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { AccountType, SettingType } from '@shared/common/types'
import { OPTIONS_PROXY, STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { exitWithLog } from '@/worker/lib/exitWithLog'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { mergeCookies } from '@/worker/lib/mergeCookies'
import { API_BASE_URL, API_ENDPOINTS } from '@/worker/platform/3In1bet/common/constants'
import { UserInfoResponse } from '@/worker/platform/3In1bet/common/types'

const LOGIN_TIMEOUT = 80_000 // 80s

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async ({ account }: { account: AccountType }) => {
  let loginCompleted = false

  // Timeout guard
  setTimeout(() => {
    if (!loginCompleted) {
      exitWithLog(port, account, `Error: Login timeout after ${LOGIN_TIMEOUT / 1000} seconds...`)
    }
  }, LOGIN_TIMEOUT)

  await loginToPlatform(port, account, () => {
    loginCompleted = true
  })
})

export async function loginToPlatform(
  port: import('worker_threads').MessagePort,
  account: AccountType,
  onLoginComplete: () => void
) {
  const updateLog = (textLog: string, statusLogin?, status?) => {
    port.postMessage({
      data: Account.update(
        { id: account.id },
        { textLog, ...(statusLogin && { statusLogin }), ...(status && { status }) }
      ),
      type: 'DataUpdateAccount'
    })
  }

  try {
    updateLog('Checking Login Info...')

    // Proxy check
    const { status, data } = isProxyConfigValid(account)
    if (!status) {
      return exitWithLog(port, account, 'Proxy Error: Invalid proxy address format.')
    }

    const { newIpAddress, newPort, newUsername, newPassword } = data
    const proxyUrl =
      account.proxyScope !== OPTIONS_PROXY.NONE
        ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
        : undefined
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

    let cookieHeader = ''

    // Step 0: homepage
    const preRes = await fetch(API_BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      redirect: 'manual',
      ...(proxyAgent && { agent: proxyAgent })
    })
    cookieHeader = mergeCookies(cookieHeader, preRes.headers.get('set-cookie'))

    // Step 0.1: check.aspx
    const checkRes = await fetch(API_ENDPOINTS.CHECK, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        Cookie: cookieHeader,
        Referer: API_BASE_URL,
        'User-Agent': 'Mozilla/5.0',
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      redirect: 'manual',
      ...(proxyAgent && { agent: proxyAgent })
    })
    cookieHeader = mergeCookies(cookieHeader, checkRes.headers.get('set-cookie'))
    cookieHeader += (cookieHeader.endsWith(';') ? ' ' : '; ') + `userName=${account.loginID}`

    // Step 1: login
    const loginRes = await fetch(API_ENDPOINTS.PROCESSLOGIN, {
      body: new URLSearchParams({
        Password: account.password,
        UserName: account.loginID,
        button: 'Login',
        isEncrypt: '0'
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookieHeader,
        Origin: API_BASE_URL,
        Referer: API_BASE_URL,
        'User-Agent': 'Mozilla/5.0',
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      method: 'POST',
      redirect: 'manual',
      ...(proxyAgent && { agent: proxyAgent })
    })

    const response = await loginRes.text()
    if (response.includes('<a href="/member/lists/password.aspx?type=2">here</a>')) {
      return exitWithLog(
        port,
        account,
        'Account password has expired. Please update it on website.'
      )
    }

    cookieHeader = mergeCookies(cookieHeader, loginRes.headers.get('set-cookie'))

    // Step 2: validate redirect
    const location = loginRes.headers.get('location')
    if (loginRes.status !== 302 || !location) {
      return exitWithLog(port, account, 'Login failed: unexpected response (no redirect).')
    }
    if (location.includes('InvalidLogin')) {
      return exitWithLog(port, account, 'Login failed: invalid username or password')
    }

    // Step 3: topheader
    const homeRes = await fetch(API_ENDPOINTS.MAIN_TOP_HEADER, {
      headers: {
        Cookie: cookieHeader,
        'User-Agent': 'Mozilla/5.0',
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      redirect: 'follow',
      ...(proxyAgent && { agent: proxyAgent })
    })
    cookieHeader = mergeCookies(cookieHeader, homeRes.headers.get('set-cookie'))

    const text = await homeRes.text()
    if (!text.includes('Logout')) {
      return exitWithLog(port, account, 'Login failed: Our website is currently under maintenance.')
    }

    // Step 4: UserInfo
    cookieHeader += (cookieHeader.endsWith(';') ? ' ' : '; ') + `DefaultOddsType=MY`
    const userInfoRes = await fetch(API_ENDPOINTS.USER_INFO_PANEL_HOST, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Cookie: cookieHeader,
        Origin: API_BASE_URL,
        Referer: API_BASE_URL + '/main/index.aspx',
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      method: 'POST',
      ...(proxyAgent && { agent: proxyAgent })
    })

    if (!userInfoRes.ok) {
      return exitWithLog(port, account, 'Login failed: cannot fetch user info.')
    }

    const userInfoJson: unknown = await userInfoRes.json()
    const userInfo = userInfoJson as Partial<UserInfoResponse>

    if (!userInfo || !('BetCredit' in userInfo)) {
      return exitWithLog(port, account, 'Login failed: invalid user info response.')
    }

    const setting = Setting.findAll()[0] as SettingType
    port.postMessage({
      data: Account.update(
        { id: account.id },
        {
          checkBoxAutoLogin: 1,
          checkBoxBet: 1,
          checkBoxRefresh: 1,
          cookie: cookieHeader,
          credit: String(userInfo.BetCredit ?? '0'),
          status: STATUS_ACCOUNT.LOGOUT,
          statusLogin: STATUS_LOGIN.SUCCESS,
          textLog: `Login ${account.loginID} successfully!`,
          typeCrawl: setting.gameType
        }
      ),
      type: 'DataUpdateAccount'
    })

    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Login Status: Login ${account.loginID} successfully!`,
      'Program'
    )

    onLoginComplete()
    process.exit(0)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ Lỗi login:', errorMessage)
    await exitWithLog(port, account, 'Login error: ' + errorMessage)
  }
}
