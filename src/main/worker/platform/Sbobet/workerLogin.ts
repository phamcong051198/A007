/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from 'node-fetch'
import FormData from 'form-data'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { MessagePort } from 'worker_threads'
import { Account, Setting } from '@db/model'
import { AccountType, SettingType } from '@shared/common/types'
import { parentPort } from 'worker_threads'
import { buildHeaders, getXsrfToken, handleLoginFail } from '@/worker/platform/Sbobet/helper'
import { OPTIONS_PROXY, STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'
import { AccountBalanceResponse } from '@/worker/platform/Sbobet/common/constants'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { accountLogToFile } from '@/worker/lib/accountLogToFile'

const port = parentPort
if (!port) throw new Error('IllegalState')

let globalCookie = ''
let proxyAgent: HttpsProxyAgent<string> | undefined

// ==== COOKIE MERGE ====
function mergeCookie(res: fetch.Response) {
  const setCookie = res.headers.get('set-cookie')
  if (!setCookie) return

  const cookieMap = {}

  if (globalCookie) {
    globalCookie.split(';').forEach((pair) => {
      const [key, value] = pair.trim().split('=')
      if (key && value) {
        cookieMap[key] = value
      }
    })
  }

  setCookie.split(',').forEach((cookieStr) => {
    const cookiePair = cookieStr.split(';')[0].trim()
    const [key, value] = cookiePair.split('=')
    if (key && value) {
      cookieMap[key] = value
    }
  })

  globalCookie = Object.entries(cookieMap)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
}

// ==== FETCH SESSION ====
async function fetchWithSession(url: string, options: any = {}): Promise<fetch.Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Cookie: globalCookie
    },
    ...(proxyAgent && { agent: proxyAgent })
  })
  mergeCookie(res)
  return res
}

port.on('message', async ({ account }: { account: AccountType }) => {
  try {
    await loginToSbobet(port, account)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    await handleLoginFail(port, account, errorMessage)
    process.exit(0)
  }
})

async function loginToSbobet(port: MessagePort, account: AccountType) {
  const accountData = await Account.findOne({ id: account.id })
  if (!accountData) throw new Error('Account not found')

  // Validate  proxy
  const { status, data } = isProxyConfigValid(account)
  if (!status) {
    await handleLoginFail(
      port,
      account,
      'Proxy Error: Invalid proxy address format – unable to determine valid URI.'
    )
    process.exit(0)
  }

  // Build proxy agent
  proxyAgent =
    account.proxyScope !== OPTIONS_PROXY.NONE
      ? new HttpsProxyAgent(
          `http://${data.newUsername}:${data.newPassword}@${data.newIpAddress}:${data.newPort}`
        )
      : undefined

  port?.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        textLog: `Verifying login information`
      }
    )
  })

  await accountLogToFile(account.platformName, account.loginID, `Verifying login`, 'Program')

  // Step 1: init homepage
  try {
    await fetchWithSession('http://www.sbobet.com')
  } catch (error) {
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `${(error as Error).message}`,
      'Program'
    )

    await handleLoginFail(port, account, 'Access Restriced')
    process.exit(0)
  }

  port?.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        textLog: `Init homepage success`
      }
    )
  })
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Step 1: Init homepage (OK)`,
    'Program'
  )

  // Step 2: get product (redirect)
  const response2 = await fetchWithSession(
    'https://api-home.sbobet.com/api/Product/GetCurrentAsiProduct?product=Sports',
    { headers: buildHeaders(account) }
  )
  const location2 = response2.headers.get('location')
  if (!location2) {
    throw new Error('No redirect location found in response')
  }
  port?.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        textLog: `Get product success`
      }
    )
  })
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Step 2: Get product (OK)`,
    'Program'
  )

  /// Step 3: authorize
  const urlObj = new URL(location2)
  const newPath = urlObj.hash.replace('#!', '')
  const url3 = `https://accounts.sbobet.com${newPath}${urlObj.search}`

  const response3 = await fetchWithSession(url3, {
    headers: buildHeaders(account),
    redirect: 'manual'
  })

  const location3 = response3.headers.get('location')
  if (!location3) {
    throw new Error('No redirect location found in response')
  }
  port?.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        textLog: `Get authorize success`
      }
    )
  })
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Step 3: Get authorize (OK)`,
    'Program'
  )

  // Step 4: redirect
  const url4 = location3
  await fetchWithSession(url4, { headers: buildHeaders(account) })
  await accountLogToFile(account.platformName, account.loginID, `Step 4: Redirect (OK)`, 'Program')

  // Step 5: redirect get xsrf
  const url5 = location3
  const response5 = await fetchWithSession(url5, { headers: buildHeaders(account) })
  const setCookie = response5.headers.get('set-cookie')
  const xsrfToken = getXsrfToken(setCookie)

  port?.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        textLog: `Get xsrf-token success`
      }
    )
  })
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Step 5: Get xsrf-token (OK)`,
    'Program'
  )

  // Step 6: login POST
  const url6 = location3
  const form = new FormData()
  form.append('Username', account.loginID)
  form.append('Password', account.password)
  form.append('Version', '1')
  form.append('DeviceType', '0')

  const response6 = await fetchWithSession(url6, {
    method: 'POST',
    headers: buildHeaders(account, { 'X-Xsrf-Token': xsrfToken }),
    body: form,
    redirect: 'manual'
  })

  if ((response6.headers.get('content-type') || '').includes('json')) {
    const dataAuth = await response6.json()
    if (dataAuth?.message) throw new Error(dataAuth.message)
  }

  const location6 = response6.headers.get('location')
  if (!location6) {
    throw new Error('No redirect location found in response')
  }

  port?.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        textLog: `Request login success`
      }
    )
  })
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Step 6: Request login (OK)`,
    'Program'
  )

  // Step 7: redirect
  const url7 = location6
  const response7 = await fetchWithSession(url7, {
    headers: buildHeaders(account, { 'X-Xsrf-Token': xsrfToken })
  })

  const location7 = response7.headers.get('location')
  if (!location7) {
    throw new Error('No redirect location found in response')
  }

  await accountLogToFile(account.platformName, account.loginID, `Step 7: Redirect (OK)`, 'Program')

  // Step 8: redirect
  const url8 = location7
  const response8 = await fetchWithSession(url8, {
    headers: buildHeaders(account, { 'X-Xsrf-Token': xsrfToken }),
    redirect: 'manual'
  })

  const location8 = response8.headers.get('location')
  if (!location8) {
    throw new Error('No redirect location found in response')
  }
  await accountLogToFile(account.platformName, account.loginID, `Step 8: Redirect (OK)`, 'Program')

  // Bước 9: getCustomerInfo
  const url9 = 'https://sportsbook.sbobet.com/api/account/getCustomerInfo'
  const response9 = await fetchWithSession(url9, {
    headers: buildHeaders(account)
  })
  const dataResponse9 = await response9.json()
  if (!dataResponse9) {
    throw new Error('No redirect location found in response')
  }
  port?.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        textLog: `Get customer-info success`
      }
    )
  })
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Step 9: Get customer-info (OK)`,
    'Program'
  )

  // Bước 10: redirect getBalance
  const url10 = 'https://api-home.sbobet.com/api/AccountBalance/Get'
  const response10 = await fetchWithSession(url10, {
    headers: buildHeaders(account, { Host: 'api-home.sbobet.com' })
  })

  const data10 = (await response10.json()) as AccountBalanceResponse
  const credit = data10?.generalBalance?.betCredit
  if (!credit) {
    throw new Error('No redirect location found in response')
  }
  await accountLogToFile(
    account.platformName,
    account.loginID,
    `Step 10: Get account-balance (OK)`,
    'Program'
  )

  const setting = Setting.findAll()[0] as SettingType
  port?.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        checkBoxBet: 1,
        checkBoxRefresh: 1,
        checkBoxAutoLogin: 1,
        typeCrawl: setting.gameType,
        credit,
        cookie: globalCookie,
        status: STATUS_ACCOUNT.LOGOUT,
        statusLogin: STATUS_LOGIN.SUCCESS,
        textLog: `Login ${account.loginID} successfully!`,
        host: 'https://sportsbook.sbobet.com/'
      }
    )
  })
  await accountLogToFile(account.platformName, account.loginID, `Login successful`, 'Program')

  process.exit(0)
}
