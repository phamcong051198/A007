import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { AccountType, WaitingSuccessContraDBType } from '@shared/common/types'
import { extractBetTable } from '@/worker/platform/3In1bet/helper'
import { BetTableData } from '@/worker/platform/3In1bet/common/types'
import { SuccessList } from '@db/model'
import { isProxyConfigValid } from '@/worker/lib/isProxyConfigValid'

/** Trả về chuỗi YYYYMMDD cho ngày truyền vào */
function formatDateString(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

/** Fetch HTML từ URL với proxy nếu có */
async function fetchWithProxy(url: string, account: AccountType) {
  const { status, data } = isProxyConfigValid(account)
  const { newIpAddress, newPort, newUsername, newPassword } = data
  const proxyUrl =
    status && account.proxyScope !== 'None'
      ? `http://${newUsername}:${newPassword}@${newIpAddress}:${newPort}`
      : undefined
  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined

  const headers: Record<string, string> = {
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'vi,en-US;q=0.9,en;q=0.8,ko;q=0.7',
    cookie: account.cookie,
    priority: 'u=0,i',
    'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    ...(account?.customIP ? { 'X-Forwarded-For': account.customIP } : {})
  }

  const res = await fetch(url, { headers, ...(proxyAgent && { agent: proxyAgent }) })
  return res.text()
}

/** Cập nhật resultBet vào successList */
function updateSuccessList(successList: WaitingSuccessContraDBType[], bets: BetTableData['bets']) {
  for (const update of bets) {
    const receiptID = update.betId
    const result = update.status

    for (const item of successList) {
      let dataPair
      try {
        dataPair = JSON.parse(item.dataPair)
      } catch {
        continue
      }

      const target = dataPair.find((p) => p.receiptID === receiptID)
      if (target && (target.resultBet === null || target.resultBet === undefined)) {
        target.resultBet = result
        SuccessList.update({ id: item.id }, { dataPair: JSON.stringify(dataPair) })
      }
    }
  }
}

/** Lấy kết quả bet cho một ngày cụ thể */
export const getResultBet_3in1BetByDate = async (
  account: AccountType,
  successList: WaitingSuccessContraDBType[],
  date: Date
) => {
  const dateStr = formatDateString(date)
  const url = `https://www.8611357.com/member/lists/paymentbetlist.aspx?MatchDate=${dateStr}&week=true`

  try {
    const html = await fetchWithProxy(url, account)
    const data = extractBetTable(html) as BetTableData
    if (data?.bets?.length) {
      updateSuccessList(successList, data.bets)
    }
  } catch (error) {
    console.error(`Error fetching RESULT_BET 3in1Bet for ${dateStr}:`, error)
  }
}

/** Lấy kết quả cho cả hôm nay và hôm qua */
export const getResultBet_3in1Bet = async (
  account: AccountType,
  successList: WaitingSuccessContraDBType[]
) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  await getResultBet_3in1BetByDate(account, successList, today)
  await getResultBet_3in1BetByDate(account, successList, yesterday)
}
