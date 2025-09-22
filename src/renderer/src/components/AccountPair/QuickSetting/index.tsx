import { QuickAmountRounderSetting } from '@renderer/components/AccountPair/QuickSetting/QuickAmountRounderSetting'
import QuickAmountSetting from '@renderer/components/AccountPair/QuickSetting/QuickAmountSetting'
import { QuickBetTargetSetting } from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting'
import QuickOddsRangeSetting from '@renderer/components/AccountPair/QuickSetting/QuickOddsRangeSetting'

import { memo, useState } from 'react'

const SettingQuickAccountPairComponent = () => {
  const [showQuickOddsRangeSetting, setShowQuickOddsRangeSetting] = useState(false)
  const [showQuickBetTargetSetting, setShowQuickBetTargetSetting] = useState(false)
  const [showQuickBetAmountSetting, setShowQuickBetAmountSetting] = useState(false)
  const [showQuickAmountRounderSetting, setShowQuickAmountRounderSetting] = useState(false)

  const quickOddsRangeSetting = () => {
    setShowQuickOddsRangeSetting(true)
  }
  const quickBetTargetSetting = () => {
    setShowQuickBetTargetSetting(true)
  }

  const quickBetAmountSetting = () => {
    setShowQuickBetAmountSetting(true)
  }

  const quickAmountRounderSetting = () => {
    setShowQuickAmountRounderSetting(true)
  }

  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <div
        className="text-[#0000FF] cursor-pointer underline text-xs font-semibold"
        onClick={quickOddsRangeSetting}
      >
        Quick Odds Range Setting
      </div>
      <div
        className="text-[#0000FF] cursor-pointer underline text-xs font-semibold"
        onClick={quickBetTargetSetting}
      >
        Quick Bet Target Setting
      </div>
      <div
        className="text-[#0000FF] cursor-pointer underline text-xs font-semibold"
        onClick={quickBetAmountSetting}
      >
        Quick Amount Setting
      </div>
      <div
        className="text-[#0000FF] cursor-pointer underline text-xs font-semibold"
        onClick={quickAmountRounderSetting}
      >
        Quick Amount Rounder Setting
      </div>

      {showQuickOddsRangeSetting && (
        <QuickOddsRangeSetting setShowQuickOddsRangeSetting={setShowQuickOddsRangeSetting} />
      )}
      {showQuickBetTargetSetting && (
        <QuickBetTargetSetting setShowQuickBetTargetSetting={setShowQuickBetTargetSetting} />
      )}
      {showQuickBetAmountSetting && (
        <QuickAmountSetting setShowQuickBetAmountSetting={setShowQuickBetAmountSetting} />
      )}
      {showQuickAmountRounderSetting && (
        <QuickAmountRounderSetting
          setShowQuickBetAmountSetting={setShowQuickAmountRounderSetting}
        />
      )}
    </div>
  )
}

export const SettingQuickAccountPair = memo(SettingQuickAccountPairComponent)
