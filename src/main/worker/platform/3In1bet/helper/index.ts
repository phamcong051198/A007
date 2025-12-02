import * as cheerio from 'cheerio'

import { BetInfo, BetTableData, Summary } from '@/worker/platform/3In1bet/common/types'

export function extractBetTable(html: string): BetTableData {
  const $ = cheerio.load(html)
  const bets: BetInfo[] = []
  const summary: Summary = { subtotalCom: '0', subtotalWin: '0', total: '0' }

  $('#GV_MBBetTrans tr').each((_, row) => {
    const $row = $(row)
    const $cells = $row.find('> td')

    // Bỏ qua header và dòng không phải dữ liệu
    if ($cells.length === 0 || $row.find('th').length > 0) return

    // === XỬ LÝ DÒNG TỔNG KẾT ===
    if ($row.hasClass('total') || $row.find('.total').length > 0) {
      const winText = $row.find('td').eq(5).find('span').eq(0).text().trim()
      const comText = $row.find('td').eq(5).find('span').eq(1).text().trim()
      const totalText = $row.find('td').eq(5).find('span').eq(2).text().trim()

      summary.subtotalWin = winText || '0'
      summary.subtotalCom = comText || '0'
      summary.total = totalText || '0'
      return
    }

    // === XỬ LÝ DÒNG CƯỢC ===
    const no = $cells.eq(0).text().trim()

    // --- Info Column (betId, sport, betTime) ---
    const $infoTable = $cells.eq(1).find('table').first()
    const infoRows = $infoTable.find('tr')
    const betId = infoRows.eq(0).find('span').text().trim()
    const sport = infoRows.eq(1).find('span').text().trim()

    // --- Status  ---
    const $statusTable = $cells.eq(6).find('table').first()
    const statusRows = $statusTable.find('tr')
    const status = statusRows.eq(0).find('span').text().trim()

    // Chỉ thêm nếu có betId
    if (betId) {
      bets.push({
        betId,
        no,
        sport,
        status
      })
    }
  })

  return { bets, summary }
}

export function createPayload(gameType) {
  const fcMap = {
    Early: '6',
    Running: '4',
    Today: '1'
  }

  return {
    SingleDouble: 'double',
    SystemLanguage: 'en-US',
    TimeFilter: '0',
    c: 'A',
    clientTime: '',
    exlist: '0',
    fav: '',
    fc: fcMap[gameType],
    keywords: '',
    m_LeagueList: '',
    m_SortByTime: '0',
    m_accType: 'MY+MR',
    m_gameType: 'S_',
    m_sp: '0'
  }
}

export function isArError(res: unknown): res is { Au: number } {
  return typeof res === 'object' && res !== null && 'Au' in res
}

export function getTodayString() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0') // tháng từ 0-11
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}
