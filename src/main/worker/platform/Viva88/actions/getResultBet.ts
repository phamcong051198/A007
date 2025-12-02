import { SuccessList } from '@db/model'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fetch from 'node-fetch'

import { AccountType, WaitingSuccessContraDBType } from '@shared/common/types'

import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'

export const getResultBet_Viva88 = async (
  account: AccountType,
  successList: WaitingSuccessContraDBType[]
) => {
  const { status, data } = isProxyConfigValid(account)
  const { newIpAddress, newPort, newUsername, newPassword } = data

  const proxyUrl =
    status && account.proxyScope !== 'None'
      ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
      : undefined

  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  const url = 'https://d.viva88.net/Statement/GetDBetListStatementApi'

  const headers = {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    cookie: account.cookie,
    devicetype: '1',
    origin: 'https://d.viva88.net',
    priority: 'u=1, i',
    referer: 'https://d.viva88.net/Statement/DBetList?GMT=7&lang=vn',
    'sec-ch-ua': `"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"`,
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': `"Windows"`,
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest',
    ...(account?.customIP ? { 'X-Forwarded-For': account.customIP } : {})
  }

  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  }

  // ✅ Tính hôm nay, hôm qua, hôm kia
  const today = new Date()
  const yesterday = new Date(today)
  const dayBeforeYesterday = new Date(today)

  yesterday.setDate(today.getDate() - 1)
  dayBeforeYesterday.setDate(today.getDate() - 2)

  // ✅ Mảng 3 ngày gần nhất
  const dates = [formatDate(today), formatDate(yesterday), formatDate(dayBeforeYesterday)]
  const dataTypes = ['1', '2']

  try {
    for (const date of dates) {
      for (const dataType of dataTypes) {
        const body = new URLSearchParams({
          GMT: '7',
          betType: '',
          dataType,
          date,
          matchId: '',
          resourceId: '',
          sportType: 'SB',
          transType: ''
        })

        const res = await fetch(url, {
          headers,
          method: 'POST',
          ...(proxyAgent && { agent: proxyAgent }),
          body
        })

        const resData = await res.json()

        if (resData.ErrorCode !== 0) continue

        const dataTickets = resData.Data.tickets as {
          SerialNo: string
          TransId: string
          Status: string
          StatusID: number
          TicketStatus: string
          UserIP: string
          TransIdFormat: string
        }[]

        if (dataTickets.length === 0) continue

        for (const update of dataTickets) {
          const receiptID = update.TransId
          const result = update.TicketStatus

          for (const items of successList) {
            const dataPair = JSON.parse(items.dataPair)
            const index = dataPair.findIndex((p) => p.receiptID === receiptID)
            if (index !== -1) {
              const currentStatus = dataPair[index]
              if (!('resultBet' in currentStatus)) currentStatus.resultBet = null

              if (currentStatus.resultBet === null || currentStatus.resultBet === undefined) {
                dataPair[index].resultBet = result
                SuccessList.update({ id: items.id }, { dataPair: JSON.stringify(dataPair) })
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching RESULT_BET VIVA88:', error)
  }
}
