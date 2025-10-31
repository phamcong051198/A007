import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { AccountType, WaitingSuccessContraDBType } from '@shared/common/types'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'
import { ResultCancelType, ResultType } from '@/worker/platform/Wbet/common/types'
import { SuccessList } from '@db/model'

// ======= Utils =======

const formatDate = (date: Date) => `${date.toISOString().split('T')[0]}T00:00:00`

const buildProxyAgent = (account: AccountType) => {
  const { status, data } = isProxyConfigValid(account)
  if (!status || account.proxyScope === 'None') return undefined
  const { newIpAddress, newPort, newUsername, newPassword } = data
  const proxyUrl = `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
  return new HttpsProxyAgent(proxyUrl)
}

const buildHeaders = (account: AccountType) => ({
  Accept: 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=UTF-8',
  Origin: 'https://true88.com',
  Referer: 'https://true88.com/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7',
  'Sec-Fetch-Mode': 'cors',
  ...(account?.customIP ? { 'X-Forwarded-For': account.customIP } : {})
})

const updateResultInDB = (
  successList: WaitingSuccessContraDBType[],
  receiptID: number,
  result: string
) => {
  for (const item of successList) {
    const dataPair = JSON.parse(item.dataPair)
    const index = dataPair.findIndex((p) => Number(p.receiptID) === receiptID)
    if (index === -1) continue

    const current = dataPair[index]
    if (current.resultBet != null) continue

    dataPair[index].resultBet = result
    SuccessList.update({ id: item.id }, { dataPair: JSON.stringify(dataPair) })
  }
}

const fetchJson = async (url: string, options) => {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`)
  return res.json()
}

// ======= Main Function =======

export const getResultBet_WBet = async (
  account: AccountType,
  successList: WaitingSuccessContraDBType[]
) => {
  const proxyAgent = buildProxyAgent(account)
  const headers = buildHeaders(account)

  const baseOptions = {
    method: 'POST',
    headers,
    ...(proxyAgent && { agent: proxyAgent })
  }

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const start_date = formatDate(yesterday)
  const end_date = formatDate(tomorrow)

  const bodyResult = JSON.stringify({
    account_id: account.loginID,
    session_token: account.cookie,
    start_date,
    end_date,
    category_type: 'sportsbook',
    page_number: 1,
    page_size: '100'
  })

  try {
    // ----- Fetch Win/Lose -----
    const resResult = await fetchJson('https://app.true88.com/gameresultsportsbook', {
      ...baseOptions,
      body: bodyResult
    })

    if (resResult.statusdesc === 'OK' && resResult.value?.Table?.length) {
      const tableData = resResult.value.Table as ResultType[]
      for (const row of tableData) {
        const result = row.winlose > 0 ? 'Win' : row.winlose < 0 ? 'Lose' : 'Unknown'
        updateResultInDB(successList, Number(row.result_id), result)
      }
    }

    // ----- Fetch Cancelled for yesterday and today -----
    const cancelledDates = [yesterday, today]

    for (const date of cancelledDates) {
      const working_date = formatDate(date)
      const bodyCancelled = JSON.stringify({
        account_id: account.loginID,
        session_token: account.cookie,
        working_date,
        page_number: 1,
        page_size: '100'
      })

      try {
        const resCancelled = await fetchJson('https://app.true88.com/cancelledbetlist', {
          ...baseOptions,
          body: bodyCancelled
        })

        if (resCancelled.statusdesc === 'OK' && Array.isArray(resCancelled.value)) {
          const tableData = resCancelled.value as ResultCancelType[]
          for (const row of tableData) {
            updateResultInDB(successList, Number(row.bet_id), row.bet_status)
          }
        }
      } catch (err) {
        console.error(
          `[WBet] Error fetching cancelled for ${account.loginID} on ${working_date}:`,
          err
        )
      }
    }
  } catch (err) {
    console.error(`[WBet] Error fetching Win/Lose for ${account.loginID}:`, err)
  }
}
