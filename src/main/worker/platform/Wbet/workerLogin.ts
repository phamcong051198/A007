import { HttpsProxyAgent } from 'https-proxy-agent'

import { Account, Setting } from '@db/model'
import { parentPort } from 'worker_threads'
import { AccountType, SettingType } from '@shared/common/types'
import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { fetchWithRetry } from '@/worker/lib/fetchWithRetry'
import { OPTIONS_PROXY, STATUS_ACCOUNT, STATUS_LOGIN } from '@shared/main/constants'
import { API_ENDPOINTS } from '@/worker/platform/Wbet/common/constants'
import { ResAuth_Wbet } from '@/worker/platform/Wbet/common/types'

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', async ({ account }: { account: AccountType }) => {
  let loginCompleted = false

  // Start timeout check
  setTimeout(async () => {
    if (!loginCompleted) {
      const textLog = 'Error: Login timeout after 10 seconds...'
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            status: STATUS_ACCOUNT.EXIT,
            checkBoxAutoLogin: 1,
            statusLogin: STATUS_LOGIN.FAIL,
            textLog
          }
        )
      })
      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Error: Access failed ${account.loginID}: ${textLog}`,
        'Program'
      )
      process.exit(0)
    }
  }, 80000)

  await loginToWbet(port, account, () => {
    loginCompleted = true
  })
})

async function loginToWbet(
  port: import('worker_threads').MessagePort,
  account: AccountType,
  onLoginComplete: () => void
) {
  try {
    if (!Account.findOne({ id: account.id })) {
      process.exit(0)
    }

    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          textLog: 'Checking Login Info...'
        }
      )
    })

    await accountLogToFile(
      account.platformName,
      account.loginID,
      'Login Status: Checking Login Info...',
      'Program'
    )

    const { status, data } = isProxyConfigValid(account)

    if (!status) {
      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Proxy Error: Invalid proxy address format – unable to determine valid URI.`,
        'Program'
      )

      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            status: STATUS_ACCOUNT.EXIT,
            statusLogin: STATUS_LOGIN.FAIL,
            textLog: `Proxy Error: Invalid proxy address format – unable to determine valid URI.`
          }
        )
      })
      process.exit(0)
    }

    const { newIpAddress, newPort, newUsername, newPassword } = data

    const proxyUrl =
      status && account.proxyScope !== OPTIONS_PROXY.NONE
        ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
        : undefined

    const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

    const resAuth = await fetchWithRetry(
      API_ENDPOINTS.AUTH,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
        },
        body: JSON.stringify({
          account_id: account.loginID,
          password: account.password
        }),
        ...(proxyAgent && { agent: proxyAgent })
      },
      3,
      10000
    )
    const dataResAuth = resAuth as ResAuth_Wbet
    if (dataResAuth.status == -500) {
      const errorMsg = 'Incorrect account or password'
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            status: STATUS_ACCOUNT.EXIT,
            statusLogin: STATUS_LOGIN.FAIL,
            textLog: `Login Error: ${errorMsg}`
          }
        )
      })

      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Error Login ${account.loginID}: ${errorMsg}`,
        'Program'
      )
      process.exit(0)
    }

    if (dataResAuth.status == 1 && dataResAuth.statusdesc == 'OK') {
      const setting = Setting.findAll()[0] as SettingType
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            checkBoxBet: 1,
            checkBoxRefresh: 1,
            checkBoxAutoLogin: 1,
            cookie: dataResAuth.member_profile.player_info[0].session_token,
            parent_id: dataResAuth.member_profile.player_info[0].parent_id,
            typeCrawl: setting.gameType,
            credit: String(dataResAuth.member_profile.player_wallet[0].available_balance),
            host: account.loginURL,
            status: STATUS_ACCOUNT.LOGOUT,
            statusLogin: STATUS_LOGIN.SUCCESS,
            textLog: `Login ${account.loginID} successfully!`
          }
        )
      })

      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Login Status: Login ${account.loginID} successfully!`,
        'Program'
      )
      onLoginComplete()
      process.exit(0)
    } else {
      throw new Error(`Unexpected response code: ${dataResAuth.status}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    let textLog = 'Error: Access failed, please try again later...'

    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('_CONNECTION_FAILED')) {
      textLog = 'Login Status: (ERROR) - Proxy connection failed.'
    } else if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      textLog = 'Login Status: (ERROR) - Request timed out.'
    } else if (errorMessage.includes('Invalid JSON')) {
      textLog = 'Login Status: (ERROR) - Invalid response from server.'
    } else if (errorMessage.includes('HTTP error')) {
      textLog = `Login Status: (ERROR) - ${errorMessage}`
    }
    console.log('Loi workerLogin Wbet: ', textLog)
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Error: Access failed ${account.loginID}:${errorMessage}`,
      'Program'
    )

    if (Account.findOne({ id: account.id })) {
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            status: STATUS_ACCOUNT.EXIT,
            statusLogin: STATUS_LOGIN.FAIL,
            checkBoxAutoLogin: 1,
            textLog
          }
        )
      })
    }

    console.log(`***************Login Wbet Fail: ${errorMessage}***************\n`)
    process.exit(0)
  }
}
