import React from 'react'
import AmountRounder from '@renderer/components/AccountPair/QuickSetting/QuickAmountRounderSetting/AmountRounder'

const AmountRounders = ({ amountRounders, setAmountRounders }) => {
  return (
    <div className="h-[400px] flex-1 flex gap-3 pt-3 px-3">
      <AmountRounder
        typeAccount="account1"
        amountRounders={amountRounders}
        setAmountRounders={setAmountRounders}
      />
      <AmountRounder
        typeAccount="account2"
        amountRounders={amountRounders}
        setAmountRounders={setAmountRounders}
      />
    </div>
  )
}
export default React.memo(AmountRounders)
