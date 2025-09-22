import { parentPort } from 'worker_threads'
import puppeteer from 'puppeteer'
import { setTimeout as delay } from 'timers/promises'
import { AccountType, SettingType } from '@shared/common/types'
import { Account, Setting } from '@db/model'
import { accountLogToFile } from '@/worker/lib/accountLogToFile'
import { getLaunchArgs } from '@/worker/lib/getLaunchArgs'
import { getChromeExecutablePath } from '@/worker/lib/getChromeExecutablePath'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { MessagePort } from 'worker_threads'
import { ResLoginViva88 } from '@/worker/platform/Viva88/common/types'
import { getBalanceViva88bet } from '@/worker/platform/Viva88/actions/getBalance'
import { STATUS_ACCOUNT } from '@shared/main/constants'

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

  let loginCompleted = false

  port.postMessage({
    type: 'DataUpdateAccount',
    data: Account.update(
      { id: account.id },
      {
        status: STATUS_ACCOUNT.LOGOUT
      }
    )
  })

  // Start timeout check
  setTimeout(async () => {
    if (!loginCompleted) {
      const textLog = 'Error: Login timeout after 10 seconds...'
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            status: 'Exit',
            statusLogin: 'Fail',
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

  await loginToViva88Bet(port, account, () => {
    loginCompleted = true
  })
})

async function loginToViva88Bet(
  port: MessagePort,
  account: AccountType,
  onLoginComplete: () => void
) {
  let socketUrl: string = ''
  try {
    const accountData = (await Account.findOne({
      id: account.id,
      statusDelete: 0
    })) as AccountType

    if (!accountData || accountData.status === STATUS_ACCOUNT.LOGIN) {
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
      `Login Status: Checking Login Info...`,
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
            status: 'Exit',
            statusLogin: 'Fail',
            textLog: `Proxy Error: Invalid proxy address format – unable to determine valid URI.`
          }
        )
      })
      process.exit(0)
    }

    const { proxyScope, newIpAddress, newPort, newUsername, newPassword } = data

    const browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      executablePath: await getChromeExecutablePath(),
      args: getLaunchArgs(proxyScope, newIpAddress, newPort)
    })

    const pages = await browser.pages()
    const page = pages[0]

    page.on('response', async (response) => {
      const request = response.request()
      if (request.method() === 'OPTIONS' || request.method() === 'GET') return
      const url = response.url()

      if (url.includes('/api/Login') && response.request().method() == 'POST') {
        const data = (await response.json()) as ResLoginViva88
        await accountLogToFile(
          account.platformName,
          account.loginID,
          `Response Login: ${JSON.stringify(data)}`,
          'Program'
        )

        if ([0, 408].includes(data.errorCode)) {
          Account.update(
            { id: account.id },
            {
              textLog: `Verifying account information...!`
            }
          )
        } else if ([2, 40, 398].includes(data.errorCode)) {
          const accountData = (await Account.findOne({
            id: account.id,
            statusDelete: 0
          })) as AccountType

          if (!accountData || accountData.status === STATUS_ACCOUNT.LOGIN) {
            process.exit(0)
          }
          port.postMessage({
            type: 'DataUpdateAccount',
            data: Account.update(
              { id: account.id },
              {
                status: 'Exit',
                statusLogin: 'Fail',
                textLog: `Login Error: Incorrect account or password`
              }
            )
          })

          await accountLogToFile(
            account.platformName,
            account.loginID,
            `Error Login ${account.loginID}: Incorrect account or password`,
            'Program'
          )
          process.exit(0)
        } else {
          const accountData = (await Account.findOne({
            id: account.id,
            statusDelete: 0
          })) as AccountType

          if (!accountData || accountData.status === STATUS_ACCOUNT.LOGIN) {
            process.exit(0)
          }

          port.postMessage({
            type: 'DataUpdateAccount',
            data: Account.update(
              { id: account.id },
              {
                status: 'Exit',
                statusLogin: 'Fail',
                textLog: `Login Error: ${data.errorMessage}`
              }
            )
          })

          await accountLogToFile(
            account.platformName,
            account.loginID,
            `Error: Login ${account.loginID}: ${data.errorMessage} Fail`,
            'Program'
          )
          process.exit(0)
        }
      }
    })

    if (proxyScope !== 'None') {
      await page.authenticate({
        username: newUsername,
        password: newPassword
      })
    }

    await page.setViewport({ width: 1920, height: 1080 })

    const cdpSession = await page.target().createCDPSession()
    await cdpSession.send('Network.enable')
    await cdpSession.send('Network.setCacheDisabled', { cacheDisabled: false })
    cdpSession.removeAllListeners()
    cdpSession.on('Network.webSocketCreated', async (payload) => {
      if (payload.url.startsWith('wss://agnj3.viva88.net/')) {
        socketUrl = payload.url as string
      }
    })

    const accountDataInfo = (await Account.findOne({
      id: account.id,
      statusDelete: 0
    })) as AccountType

    if (!accountDataInfo || accountDataInfo.status === STATUS_ACCOUNT.LOGIN) {
      process.exit(0)
    }

    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          textLog: 'Accessing website...'
        }
      )
    })
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Login Status: Accessing website...`,
      'Program'
    )

    await page.goto('https://www.viva88.net/b/en', { waitUntil: 'load', timeout: 90000 })
    await delay(1000)
    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          textLog: 'Accessing website success'
        }
      )
    })
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Login Status: Accessing website success`,
      'Program'
    )

    const bodyHTML = await page.content()
    const errorChecks = [
      {
        keyword: 'Access Denied',
        logMessage: 'Login Failed: Access Denied',
        textLog: 'Access Denied...'
      },
      {
        keyword: "<h2>We'll Be Right Back！</h2>",
        logMessage: 'Login Failed: Website access error is under maintenance...',
        textLog: 'Website access error is under maintenance...'
      }
    ]

    for (const check of errorChecks) {
      if (bodyHTML.includes(check.keyword)) {
        const accountData = (await Account.findOne({
          id: account.id,
          statusDelete: 0
        })) as AccountType

        if (!accountData || accountData.status === STATUS_ACCOUNT.LOGIN) {
          process.exit(0)
        }

        port.postMessage({
          type: 'DataUpdateAccount',
          data: Account.update(
            { id: account.id },
            {
              status: 'Exit',
              statusLogin: 'Fail',
              textLog: check.textLog
            }
          )
        })

        await accountLogToFile(account.platformName, account.loginID, check.logMessage, 'Program')

        process.exit(0)
      }
    }
    // Load lại trang
    await page.reload({ waitUntil: 'networkidle0' })
    await delay(1000)

    const closeButtonSelector = 'i.icon.icon--close'
    const isCloseButtonVisible = await page.$(closeButtonSelector)

    if (isCloseButtonVisible) {
      await page.click(closeButtonSelector)
      await delay(1000)
    }

    await delay(1000)
    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          textLog: 'Filling in account information'
        }
      )
    })
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Login Status: Filling in account information`,
      'Program'
    )
    const accountDataCheck1 = (await Account.findOne({
      id: account.id,
      statusDelete: 0
    })) as AccountType

    if (!accountDataCheck1 || accountDataCheck1.status === STATUS_ACCOUNT.LOGIN) {
      process.exit(0)
    }
    // Chờ nút login rồi click
    await page.waitForSelector('a.btn.btn--secondary', { visible: true, timeout: 30000 })
    await page.click('a.btn.btn--secondary')

    // Đợi form login hiện ra
    await page.waitForSelector('.login-form[data-open="true"] input#username', {
      visible: true,
      timeout: 30000
    })

    // Nhập username & password
    await page.type('#username', account.loginID, { delay: 50 })
    await page.type('#password', account.password, { delay: 50 })
    await page.click('.login-form__item > a')

    // Chờ web load và kiểm tra có popup đồng ý/ từ chối không
    try {
      await page.waitForSelector('.btn-group .btn.btn--agree', { visible: true, timeout: 5000 })
      await page.click('.btn-group .btn.btn--agree')
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            textLog: `Processing approval of terms of use for new account`
          }
        )
      })

      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Login Status: New account. Clicked Agree to terms of use`,
        'Program'
      )
    } catch (e) {
      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Login Status: Valid account. Already used.`,
        'Program'
      )
    }

    const accountDataInfoNew = (await Account.findOne({
      id: account.id,
      statusDelete: 0
    })) as AccountType

    if (!accountDataInfoNew || accountDataInfoNew.status === STATUS_ACCOUNT.LOGIN) {
      process.exit(0)
    }

    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          textLog: `Wait for the website to load all requests`
        }
      )
    })
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Login Status: Wait for the website to load all requests`,
      'Program'
    )

    const pageTitle = await page.title()

    if (pageTitle.includes('Recaptcha')) {
      port.postMessage({
        type: 'DataUpdateAccount',
        data: Account.update(
          { id: account.id },
          {
            status: 'Exit',
            statusLogin: 'Fail',
            textLog: 'Login Status: (ERROR)-System Account ID not found!'
          }
        )
      })
      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Error: Access failed ${account.loginID}: System Account ID not found!`,
        'Program'
      )
      console.log('***************Login Viva88 Fail Recaptcha ****************\n')
      process.exit(0)
    }

    const cookies = await page.cookies()
    const cookieString = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
    const host = new URL(page.url()).origin

    if (cookieString && socketUrl) {
      Account.update({ id: account.id }, { cookie: cookieString, host, socketUrl }) as AccountType

      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Login Status: Login ${account.loginID} successfully!`,
        'Program'
      )

      const accountData = (await Account.findOne({
        id: account.id,
        statusDelete: 0
      })) as AccountType

      if (!accountData || accountData.status === STATUS_ACCOUNT.LOGIN) {
        process.exit(0)
      }

      const setting = Setting.findAll()[0] as SettingType
      const balance = await getBalanceViva88bet(accountData)

      port.postMessage({
        type: 'LoginSuccess',
        data: Account.update(
          { id: account.id },
          {
            checkBoxBet: 1,
            checkBoxRefresh: 1,
            checkBoxAutoLogin: 1,
            credit: balance.Data,
            typeCrawl: setting.gameType,
            status: 'Logout',
            statusLogin: 'Success',
            textLog: `Login ${account.loginID} successfully!`
          }
        )
      })

      onLoginComplete()
      process.exit(0)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log('Error: Login Viva88:', errorMessage)
    let textLog = 'Error: Access failed, please try again later...'
    if (errorMessage.includes('_CONNECTION_FAILED')) {
      textLog = 'Login Status: (ERROR) - Proxy connection failed.'
    }

    const accountData = (await Account.findOne({
      id: account.id,
      statusDelete: 0
    })) as AccountType

    if (!accountData || accountData.status === STATUS_ACCOUNT.LOGIN) {
      process.exit(0)
    }

    port.postMessage({
      type: 'DataUpdateAccount',
      data: Account.update(
        { id: account.id },
        {
          status: 'Exit',
          statusLogin: 'Fail',
          textLog
        }
      )
    })
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Error: Access failed ${account.loginID}:${errorMessage}`,
      'Program'
    )
    console.log('***************Login Viva88 Fail***************\n', error)
    process.exit(0)
  }
}
