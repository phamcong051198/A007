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
  creditEach: number = 40
): ArbitrageResult {
  const stakeA = creditEach
  const stakeB = creditEach
  const profitIfAWin = calcMyProfitWin(stakeA, oddA_MY) - calcMyProfitLose(stakeB, oddB_MY)
  const profitIfBWin = calcMyProfitWin(stakeB, oddB_MY) - calcMyProfitLose(stakeA, oddA_MY)

  const isArbitrage =
    (profitIfAWin >= 0 && profitIfBWin > 0) || (profitIfAWin > 0 && profitIfBWin >= 0)

  return {
    isArbitrage,
    oddA_MY,
    oddB_MY,
    profitIfAWin: Number(profitIfAWin.toFixed(3)),
    profitIfBWin: Number(profitIfBWin.toFixed(3)),
    stakeA,
    stakeB
  }
}

/**
 * ✅ Hàm chính kiểm tra cặp có arbitrage thật hay không
 */
export function checkArbitrageMy(
  oddA_MY: number,
  oddB_MY: number,
  creditEach: number = 40
): ArbitrageResult {
  const best = findProfitableMyArbitrage(oddA_MY, oddB_MY, creditEach)
  return best
}
