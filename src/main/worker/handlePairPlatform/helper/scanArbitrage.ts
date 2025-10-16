interface ArbitrageResult {
  isArbitrage: boolean
  oddA_MY: number
  oddB_MY: number
  stakeA: number
  stakeB: number
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
    // Tính stakeB tối thiểu để profitIfAWin ≥ 0
    let stakeB = (stakeA * (oddA_MY > 0 ? oddA_MY + 1 : 1)) / (oddB_MY > 0 ? oddB_MY : 1)
    stakeB = Math.min(stakeB, creditEach)
    if (stakeB < 5) continue

    const profitIfAWin = calcMyProfitWin(stakeA, oddA_MY) - calcMyProfitLose(stakeB, oddB_MY)
    const profitIfBWin = calcMyProfitWin(stakeB, oddB_MY) - calcMyProfitLose(stakeA, oddA_MY)

    if (profitIfAWin > 0 && profitIfBWin > 0) {
      if (!best) {
        best = {
          isArbitrage: true,
          oddA_MY,
          oddB_MY,
          stakeA,
          stakeB,
          profitIfAWin,
          profitIfBWin
        }
        return best
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
