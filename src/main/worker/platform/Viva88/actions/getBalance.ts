import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { AccountType } from '@shared/common/types'
import { accountLogToFile } from '@/worker/lib/accountLogToFile'

export const getBalanceViva88bet = async (account: AccountType) => {
  const { proxyIP, proxyPort, proxyUsername, proxyPassword, proxyScope } = account
  const proxyUrl =
    proxyScope !== 'None' && proxyIP && proxyPort && proxyUsername && proxyPassword
      ? `http://${proxyUsername}:${proxyPassword}@${proxyIP}:${proxyPort}`
      : undefined
  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  const { ErrorCode, Data } = await loginCheckin(account, proxyAgent)

  if (ErrorCode === 106 || ErrorCode === -1 || ErrorCode === 210) {
    return { ErrorCode, Data }
  }

  const dataBalance = await balance(account, proxyAgent, Data)
  return dataBalance
}

async function loginCheckin(account: AccountType, proxyAgent: HttpsProxyAgent<string> | undefined) {
  const maxRetries = 3
  let attempt = 0

  while (attempt < maxRetries) {
    attempt++
    try {
      const urlLoginCheckin = `${account.host}/LoginCheckin/Index`

      const headerLoginCheckin = {
        Referer: `${account.host}/sports`,
        'Accept-Language':
          'en-US,en;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6,ja;q=0.5,cs;q=0.4,zh-TW;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        Username: account.loginID,
        Devicetype: '1',
        Uid: account.loginID,
        Origin: account.host,
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Cookie: account.cookie,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const resLoginCheckin = await fetch(urlLoginCheckin, {
        method: 'POST',
        headers: headerLoginCheckin,
        signal: controller.signal,
        ...(proxyAgent && { agent: proxyAgent })
      })

      clearTimeout(timeoutId)

      const resDataLoginCheckin = await resLoginCheckin.json()

      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Res LoginCheckin: ${JSON.stringify(resDataLoginCheckin)}`,
        'Program'
      )

      if (resDataLoginCheckin.ErrorCode == 106) {
        return { ErrorCode: 106, Data: 'Another session logged in. Forced to logout.' }
      } else if (resDataLoginCheckin.ErrorCode == 210) {
        return { ErrorCode: 210, Data: 'Error: Authentication failed.' }
      } else if (resDataLoginCheckin.ErrorCode !== 0) {
        return { ErrorCode: -1, Data: 'Error: Get Access token Viva88Bet Fail...' }
      }

      return {
        ErrorCode: 0,
        Data: resDataLoginCheckin.Data.at
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log('Error resLoginCheckin Viva88bet', errorMessage)
      await accountLogToFile(
        account.platformName,
        account.loginID,
        `Error Res LoginCheckin: ${errorMessage}`,
        'Program'
      )

      // Nếu lỗi là ETIMEDOUT, thử lại
      if (errorMessage.includes('ETIMEDOUT') && attempt < maxRetries) {
        console.log(`Retrying (${attempt}/${maxRetries})...`)
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Đợi 2 giây trước khi thử lại
        continue
      }

      return {
        ErrorCode: -1,
        Data: `Error: ${errorMessage}`
      }
    }
  }

  return {
    ErrorCode: -1,
    Data: 'Error: Max retries reached due to persistent ETIMEDOUT.'
  }
}

async function balance(
  account: AccountType,
  proxyAgent: HttpsProxyAgent<string> | undefined,
  at: string
) {
  try {
    const urlBalance = `https://api.viva88.net/api/Customer/Balance`
    const headerBalance = {
      Referer: `${account.host}/sports`,
      'Accept-Language':
        'en-US,en;q=0.9,th;q=0.8,zh-CN;q=0.7,zh;q=0.6,ja;q=0.5,cs;q=0.4,zh-TW;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br',
      Username: account.loginID,
      Devicetype: '1',
      Uid: account.loginID,
      Origin: account.host,
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Authorization: `bearer ${at}`,
      Cookie: account.cookie,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      ...(account.customIP ? { 'X-Forwarded-For': account.customIP } : {})
    }

    const resBalance = await fetch(urlBalance, {
      method: 'POST',
      headers: headerBalance,
      ...(proxyAgent && { agent: proxyAgent })
    })
    const resData = (await resBalance.json()) as {
      Data: {
        BCredit: string
      }
    }
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Res Balance : ${JSON.stringify(resData)}`,
      'Program'
    )

    return { ErrorCode: 0, Data: resData.Data.BCredit }
  } catch (error) {
    console.log(
      'Error fetching account-balance Viva88:',
      error instanceof Error ? error.message : String(error)
    )
    await accountLogToFile(
      account.platformName,
      account.loginID,
      `Error Res Balance :  ${error instanceof Error ? error.message : String(error)}`,
      'Program'
    )

    return {
      ErrorCode: -1,
      Data: `Error:   ${error instanceof Error ? error.message : 'Unstable network, proxy or server-side issue.'} `
    }
  }
}
