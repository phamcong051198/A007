interface ArbitrageResult {
  isArbitrage: boolean
  oddA_MY: number
  oddB_MY: number
  stakeA: number
  stakeB: number
  totalIfAWin: number
  totalIfBWin: number
  profitIfAWin: number
  profitIfBWin: number
}

function calcMyProfitWin(stake: number, myOdd: number): number {
  if (isNaN(myOdd)) return NaN
  return myOdd > 0 ? stake * myOdd : stake
}

function calcMyProfitLose(stake: number, myOdd: number): number {
  if (isNaN(myOdd)) return NaN
  return myOdd > 0 ? stake : stake * myOdd * -1
}

function findProfitableMyArbitrage(
  oddA_MY: number,
  oddB_MY: number,
  creditEach: number = 100
): ArbitrageResult | null {
  let best: ArbitrageResult | null = null

  for (let stakeA = creditEach; stakeA >= 5; stakeA--) {
    for (let stakeB = creditEach; stakeB >= 5; stakeB--) {
      // lợi nhuận khi thắng
      const profitA_Win = calcMyProfitWin(stakeA, oddA_MY)
      const profitB_Win = calcMyProfitWin(stakeB, oddB_MY)

      // lợi nhuận khi thua
      const profitA_Lose = calcMyProfitLose(stakeA, oddA_MY)
      const profitB_Lose = calcMyProfitLose(stakeB, oddB_MY)

      // tổng credit sau khi A thắng hoặc B thắng
      const totalIfAWin = stakeA + stakeB - profitB_Lose + profitA_Win
      const totalIfBWin = stakeA + stakeB - profitA_Lose + profitB_Win

      // tổng profit (so với vốn tổng)
      const profitIfAWin = +(totalIfAWin - (stakeA + stakeB)).toFixed(2)
      const profitIfBWin = +(totalIfBWin - (stakeA + stakeB)).toFixed(2)

      if ((profitIfAWin > 0 && profitIfBWin >= 0) || (profitIfAWin >= 0 && profitIfBWin > 0)) {
        if (!best) {
          best = {
            isArbitrage: true,
            oddA_MY,
            oddB_MY,
            stakeA,
            stakeB,
            totalIfAWin,
            totalIfBWin,
            profitIfAWin,
            profitIfBWin
          }
          return best
        }
      }
    }
  }

  return best
}

/**
 * ✅ Hàm chính kiểm tra cặp có arbitrage thật hay không
 */
export function checkArbitrageMy(
  oddA_MY: number,
  oddB_MY: number,
  creditEach: number = 100
): ArbitrageResult | null {
  const best = findProfitableMyArbitrage(oddA_MY, oddB_MY, creditEach)
  if (!best) return null
  return best
}
