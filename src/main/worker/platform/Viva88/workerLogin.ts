import { MessagePort, parentPort } from 'worker_threads'

import { Account, Setting } from '@db/model'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { AccountType, SettingType } from '@shared/common/types'
import { OPTIONS_PROXY, STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { exitWithLog } from '@/worker/lib/exitWithLog'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { mergeCookies } from '@/worker/lib/mergeCookies'
import { getBalanceViva88bet } from '@/worker/platform/Viva88/actions/getBalance'
import { API_BASE_URL, API_ENDPOINTS } from '@/worker/platform/Viva88/common/constants'
import { LoginResponse } from '@/worker/platform/Viva88/common/types'
import { buildSocketIoWsUrl, CFS, extractTkAndId } from '@/worker/platform/Viva88/helper'

const port = parentPort

if (!port) throw new Error('IllegalState')

port.on('message', async ({ account }: { account: AccountType }) => {
  const accountData = (await Account.findOne({
    id: account.id,
    statusDelete: 0
  })) as AccountType

  if (!accountData || accountData.status === STATUS_ACCOUNT.LOGIN) {
    process.exit(0)
  }

  await loginToViva88Bet(port, account)
})

async function loginToViva88Bet(port: MessagePort, account: AccountType) {
  const updateLog = (textLog: string, statusLogin?, status?) => {
    port.postMessage({
      data: Account.update(
        { id: account.id },
        { textLog, ...(statusLogin && { statusLogin }), ...(status && { status }) }
      ),
      type: 'DataUpdateAccount'
    })
  }

  let cookieHeader = `LOGIN_PLATFORM=desktop;rememberMe=false;_culture=en-US`
  try {
    updateLog('Checking Login Info...')

    // Proxy check
    const { status, data } = isProxyConfigValid(account)
    if (!status) {
      return exitWithLog(port, account, 'Proxy Error: Invalid proxy address format.')
    }

    const { proxyScope, newIpAddress, newPort, newUsername, newPassword } = data
    const proxyUrl =
      proxyScope !== OPTIONS_PROXY.NONE
        ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
        : undefined
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

    // Step 0: homepage
    updateLog('Step 0: Requesting homepage...')
    const preRes = await fetch(API_BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      redirect: 'manual',
      ...(proxyAgent && { agent: proxyAgent })
    })
    cookieHeader = mergeCookies(cookieHeader, preRes.headers.get('set-cookie'))
    accountLogToFile(
      account.platformName,
      account.loginID,
      `Step 0: Requesting homepage (OK)`,
      'Program'
    )

    // Step 1: login
    updateLog('Step 1: Sending login request...')
    const loginRes = await fetch(API_ENDPOINTS.LOGIN, {
      body: JSON.stringify({
        language: 'en',
        loginCode: '',
        password: CFS(account.password),
        platform: 'desktop',
        username: account.loginID
      }),
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Content-Type': 'application/json',
        Host: 'api.viva88.net',
        Origin: API_BASE_URL,
        Referer: API_BASE_URL,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      method: 'POST',
      ...(proxyAgent && { agent: proxyAgent })
    })
    cookieHeader = mergeCookies(cookieHeader, loginRes.headers.get('set-cookie'))

    const resData = (await loginRes.json()) as LoginResponse
    const errorCode = resData.errorCode
    const errorMessage = resData.errorMessage
    const redirectUrl = resData.redirectUrl

    accountLogToFile(
      account.platformName,
      account.loginID,
      `Response Step 1: ${JSON.stringify(resData)}`,
      'Program'
    )

    if (errorCode !== 408 && errorCode !== 0) {
      throw new Error(`Login failed: ${errorMessage}`)
    }

    if (!redirectUrl) {
      throw new Error('Login failed: No data redirectUrl')
    }
    accountLogToFile(
      account.platformName,
      account.loginID,
      `Step 1: Sending login request (OK)`,
      'Program'
    )

    // Step 2: Goto RedirectUrl
    updateLog('Step 2: Following redirect URL...')
    const resRedirectUrl = await fetch(redirectUrl, {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        Cookie: 'LOGIN_PLATFORM=desktop; rememberMe=false',
        Host: 'd.viva88.net',
        Priority: 'u=0, i',
        Referer: 'https://www.viva88.net/',
        'Sec-Ch-Ua': `"Not=A?Brand";v="24", "Chromium";v="140"`,
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': `"Windows"`,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-site',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
      },
      method: 'GET',
      redirect: 'manual',
      ...(proxyAgent && { agent: proxyAgent })
    })

    const location = resRedirectUrl.headers.get('location')
    cookieHeader = mergeCookies(cookieHeader, resRedirectUrl.headers.get('set-cookie'))

    if (!location) {
      throw new Error('Login failed: No data location')
    }
    accountLogToFile(
      account.platformName,
      account.loginID,
      `Step 2: Following redirect URL (OK)`,
      'Program'
    )

    // Step 3: Goto Home/Index by location
    updateLog('Step 3: Accessing Home/Index page...')
    const resHomeIndex = await fetch(location, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        Cookie: cookieHeader,
        Host: 'd.viva88.net',
        Referer: 'https://www.viva88.net/'
      },
      method: 'GET',
      redirect: 'manual',
      ...(proxyAgent && { agent: proxyAgent })
    })
    const dataHomeIndex = await resHomeIndex.text()
    const result = await extractTkAndId(dataHomeIndex)
    if (!result) {
      throw new Error('Login failed: Failed to extract tk and ID socket')
    }

    const socketUrl = buildSocketIoWsUrl(result.tk, result.ID)

    const accountUpdate = Account.update(
      { id: account.id },
      { cookie: cookieHeader, host: 'https://d.viva88.net', socketUrl }
    ) as AccountType

    accountLogToFile(
      account.platformName,
      account.loginID,
      `Step 3: Accessing Home/Index page (OK)`,
      'Program'
    )

    // Step 4: Get data balance
    updateLog('Step 4: Fetching balance...')
    const dataBalance = await getBalanceViva88bet(accountUpdate)

    const setting = Setting.findAll()[0] as SettingType
    port.postMessage({
      data: Account.update(
        { id: account.id },
        {
          checkBoxAutoLogin: 1,
          checkBoxBet: 1,
          checkBoxRefresh: 1,
          credit: dataBalance.Data,
          status: STATUS_ACCOUNT.LOGOUT,
          statusLogin: STATUS_LOGIN.SUCCESS,
          textLog: `Login ${account.loginID} successfully!`,
          typeCrawl: setting.gameType
        }
      ),
      type: 'LoginSuccess'
    })
    updateLog(`Login ${account.loginID} successfully!`)

    accountLogToFile(
      account.platformName,
      account.loginID,
      `Login Status: Login ${account.loginID} successfully!`,
      'Program'
    )
    process.exit(0)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error(errorMessage)
    await exitWithLog(port, account, errorMessage)
  }
}
