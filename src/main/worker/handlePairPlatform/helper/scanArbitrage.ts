/**
 * ================================
 *  ⚽ ARBITRAGE CHECK (MY ODDS)
 * ================================
 *
 *  ✔ Tính theo MY odds thật
 *  ✔ Loại bỏ quarter handicap
 *  ✔ Tìm stake integer tối ưu
 *  ✔ Chỉ nhận kèo có lời ở cả 2 chiều
 *  ✔ Cho phép minProfit% tuỳ chỉnh
 */

interface ArbitrageResult {
  isArbitrage: boolean
  oddA_MY: string | number
  oddB_MY: string | number
  oddA_dec: number
  oddB_dec: number
  stakeA: number
  stakeB: number
  profitHome: number
  profitAway: number
  minProfit: number
  profitPercent: number
}

interface PlatformData {
  matchId: string
  type: string
  hdp_point: string | number
  home_over: string | number
  away_under: string | number
}

interface ArbitrageMatch extends ArbitrageResult {
  matchId: string
  type: string
  hdp: string | number
  direction: string
}

/**
 * ✅ Chuyển MY → Decimal
 */
function myToDecimal(myOdd: string | number): number | null {
  const o = parseFloat(String(myOdd))
  if (isNaN(o)) return null
  return o >= 0 ? o + 1 : 1 + 1 / Math.abs(o)
}

/**
 * ✅ Tính lợi nhuận khi thắng theo MY odds
 */
function calcMyProfit(stake: number, myOdd: string | number): number {
  const o = parseFloat(String(myOdd))
  if (isNaN(o)) return NaN
  return o >= 0 ? stake * o : stake / Math.abs(o) - stake
}

/**
 * ✅ Kiểm tra kèo là half (0.5, 1.5, 2.5...) — bỏ quarter
 */
export function isHalfHandicap(value: string | number): boolean {
  const num = parseFloat(String(value))
  if (isNaN(num)) return false
  return Math.abs(num * 2) % 2 === 1 // chỉ nhận .5
}

/**
 * ✅ Tìm stake integer tối ưu sao cho cả 2 bên đều có lãi
 */
function findProfitableMyArbitrage(
  oddA_MY: string | number,
  oddB_MY: string | number,
  totalStake: number = 100
): {
  stakeA: number
  stakeB: number
  profitHome: number
  profitAway: number
  minProfit: number
} | null {
  let best: {
    stakeA: number
    stakeB: number
    profitHome: number
    profitAway: number
    minProfit: number
  } | null = null

  for (let stakeA = 1; stakeA < totalStake; stakeA++) {
    const stakeB = totalStake - stakeA

    const profitHome = calcMyProfit(stakeA, oddA_MY) - stakeB
    const profitAway = calcMyProfit(stakeB, oddB_MY) - stakeA
    const minProfit = Math.min(profitHome, profitAway)

    // chỉ lấy nếu cả hai cùng lời
    if (profitHome > 0 && profitAway > 0) {
      if (!best || minProfit > best.minProfit) {
        best = { stakeA, stakeB, profitHome, profitAway, minProfit }
      }
    }
  }

  return best
}

/**
 * ✅ Kiểm tra 1 cặp odd có arbitrage thật không
 */
export function checkArbitrage(
  oddA_MY: string | number,
  oddB_MY: string | number,
  totalStake: number = 100,
  minProfitPercent: number = 2
): ArbitrageResult | null {
  const oddA_dec = myToDecimal(oddA_MY)
  const oddB_dec = myToDecimal(oddB_MY)
  if (!oddA_dec || !oddB_dec) return null

  const best = findProfitableMyArbitrage(oddA_MY, oddB_MY, totalStake)

  if (!best) return null

  const profitPercent = (best.minProfit / totalStake) * 100

  if (profitPercent < minProfitPercent) return null

  return {
    isArbitrage: true,
    oddA_MY,
    oddB_MY,
    oddA_dec,
    oddB_dec,
    ...best,
    profitPercent: 999
  }
}

/**
 * ✅ Quét arbitrage giữa 2 platform
 */
export function scanArbitrage(
  platformA: PlatformData[],
  platformB: PlatformData[],
  totalStake: number = 100,
  minProfitPercent: number = 2
): ArbitrageMatch[] {
  const results: ArbitrageMatch[] = []

  for (const a of platformA) {
    if (!isHalfHandicap(a.hdp_point)) continue // bỏ quarter

    for (const b of platformB) {
      if (a.matchId !== b.matchId || a.type !== b.type) continue

      const arb1 = checkArbitrage(a.home_over, b.away_under, totalStake, minProfitPercent)
      if (arb1) {
        results.push({
          matchId: a.matchId,
          type: a.type,
          hdp: a.hdp_point,
          direction: 'A.home_over vs B.away_under',
          ...arb1
        })
      }

      const arb2 = checkArbitrage(a.away_under, b.home_over, totalStake, minProfitPercent)
      if (arb2) {
        results.push({
          matchId: a.matchId,
          type: a.type,
          hdp: a.hdp_point,
          direction: 'A.home_over vs B.away_under',
          ...arb2
        })
      }
    }
  }

  results.sort((a, b) => b.profitPercent - a.profitPercent)
  return results
}
