import { setTimeout as delay } from 'timers/promises'
import { MessagePort, parentPort } from 'worker_threads'

import { Account, Setting } from '@db/model'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { AccountType, SettingType } from '@shared/common/types'
import { OPTIONS_PROXY, STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'

import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { getBalanceP88bet } from '@/worker/platform/P88/actions/getBalance'
import { API_ENDPOINTS, buildHeadersLogin } from '@/worker/platform/P88/common/contants'
import {
  extractCookie,
  handleLoginFail,
  parseLoginResponse,
  updateAccountStatus
} from '@/worker/platform/P88/helper'

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async ({ account }: { account: AccountType }) => {
  await loginToP88Bet(port, account)
})

async function loginToP88Bet(port: MessagePort, account: AccountType) {
  try {
    if (!Account.findOne({ id: account.id })) {
      process.exit(0)
    }

    await updateAccountStatus(port, account, 'Checking Login Info...')
    await accountLogToFile(
      account.platformName,
      account.loginID,
      'Login Status: Checking Login Info...',
      'Program'
    )

    // validate proxy
    const { status, data } = isProxyConfigValid(account)
    if (!status) {
      await handleLoginFail(
        port,
        account,
        'Proxy Error: Invalid proxy address format – unable to determine valid URI.'
      )
      process.exit(0)
    }

    // build proxy agent
    const proxyUrl =
      account.proxyScope !== OPTIONS_PROXY.NONE
        ? `http://${data.newUsername}:${data.newPassword}@${data.newIpAddress}:${data.newPort}`
        : undefined
    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

    // call API
    const res = await fetch(API_ENDPOINTS.AUTH, {
      headers: buildHeadersLogin(account),
      method: 'POST',
      ...(proxyAgent && { agent: proxyAgent }),
      body: new URLSearchParams({
        captcha: '',
        captchaToken: '',
        loginId: account.loginID,
        password: account.password
      })
    })

    if (res.status === 405) {
      await accountLogToFile(account.platformName, account.loginID, 'UNDER MAINTENANCE', 'Program')
      port.postMessage({
        data: Account.update(
          { id: account.id },
          {
            checkBoxAutoLogin: 1,
            status: STATUS_ACCOUNT.EXIT,
            statusLogin: STATUS_LOGIN.FAIL,
            textLog: 'UNDER MAINTENANCE'
          }
        ),
        type: 'DataUpdateAccount'
      })

      process.exit(0)
    }

    const cookieHeader = extractCookie(res.headers.get('set-cookie'))
    const { status: loginStatus, message } = await parseLoginResponse(res)

    if (loginStatus === 'success') {
      await accountLogToFile(account.platformName, account.loginID, 'Login Success', 'Program')

      const accountUpdated = Account.update(
        { id: account.id },
        {
          cookie: cookieHeader
        }
      ) as AccountType

      const { ErrorCode, Data } = await getBalanceP88bet(accountUpdated)
      const credit = Number(Data.trim())

      if (ErrorCode == 0 && !Number.isNaN(credit)) {
        const setting = Setting.findAll()[0] as SettingType
        port.postMessage({
          data: Account.update(
            { id: account.id },
            {
              checkBoxAutoLogin: 1,
              checkBoxBet: 1,
              checkBoxRefresh: 1,
              credit: Data,
              status: STATUS_ACCOUNT.LOGOUT,
              statusLogin: STATUS_LOGIN.SUCCESS,
              textLog: `Login ${account.loginID} successfully!`,
              typeCrawl: setting.gameType
            }
          ),
          type: 'DataUpdateAccount'
        })
        await delay(2000)
        process.exit(0)
      }
    }

    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Login Fail: ${message}`,
      'Program'
    )
    port.postMessage({
      data: Account.update(
        { id: account.id },
        {
          status: STATUS_ACCOUNT.EXIT,
          statusLogin: STATUS_LOGIN.FAIL,
          textLog: `Login failed: ${message}`
        }
      ),
      type: 'DataUpdateAccount'
    })

    process.exit(0)
  } catch (err) {
    console.error('Lỗi loginToP88Bet:', err)
    await handleLoginFail(port, account, `Unexpected error: ${String(err)}`)
    process.exit(0)
  }
}
