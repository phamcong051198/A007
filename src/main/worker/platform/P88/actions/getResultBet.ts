import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { AccountType, WaitingSuccessContraDBType } from '@shared/common/types'

import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { SuccessList } from '@db/model'

export const getResultBet_P88 = async (
  account: AccountType,
  successList: WaitingSuccessContraDBType[]
) => {
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

  const now = new Date()
  now.setDate(now.getDate() + 1)
  const t = now.toISOString().slice(0, 10) + ' 00:00:00'

  const past = new Date()
  past.setDate(now.getDate() - 4)
  const f = past.toISOString().slice(0, 10) + ' 00:00:00'

  const body = new URLSearchParams({
    f,
    t,
    d: '0',
    s: 'SETTLED',
    sd: 'true',
    type: 'STATEMENT',
    product: 'SB',
    timezone: 'GMT-4',
    sportId: '',
    leagueId: ''
  })

  try {
    const url = 'https://www.p88.bet/member-service/v2/wager-filter?locale=en_US'
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'accept-language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        origin: 'https://www.p88.bet',
        priority: 'u=1, i',
        referer: 'https://www.p88.bet/en/account/my-bets-full',
        'sec-ch-ua': `"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"`,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': `"Windows"`,
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest',
        'x-browser-session-id': objectCookie.BrowserSessionId,
        'x-custid': objectCookie.custid,
        'x-u': objectCookie.u,
        'x-slid': objectCookie.SLID,
        'x-lcu': objectCookie.lcu,
        cookie: cookie,
        ...(account?.customIP ? { 'X-Forwarded-For': account.customIP } : {})
      },
      ...(proxyAgent && { agent: proxyAgent }),
      body
    })

    const dataUpdate = await res.json()

    if (dataUpdate.length > 0) {
      for (const update of dataUpdate) {
        const receiptID = String(update[7])
        const result = update[6] != null ? update[6] : update[43]

        for (const items of successList) {
          const dataPair = JSON.parse(items.dataPair)
          const index = dataPair.findIndex((p) => p.receiptID === receiptID)
          if (index !== -1) {
            const currentStatus = dataPair[index]
            if (!('resultBet' in currentStatus)) {
              currentStatus.resultBet = null
            }

            if (currentStatus.resultBet === null || currentStatus.resultBet === undefined) {
              dataPair[index].resultBet = result
              const ticketUpdate = dataPair
              SuccessList.update(
                { id: items.id },
                {
                  dataPair: JSON.stringify(ticketUpdate)
                }
              )
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching RESULT_BET P88:', error)
  }
}
