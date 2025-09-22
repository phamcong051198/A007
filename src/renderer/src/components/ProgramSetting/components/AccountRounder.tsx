import React, { useState } from 'react'

import TargetGeneralSetting from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting/TargetGeneralSetting'
import TargetDetailedSetting from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting/TargetDetailedSetting'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { Label } from '@renderer/components/ui/label'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { DetailedSettingsSection } from './DetailedSettingSection'
import { AmountRounderSettingType } from '@shared/common/types'
import { calculateRoundedValue } from '@renderer/lib/calculateRoundedValue'
import { SwitchCustom } from '@renderer/components/ui/switch'
import { InputNumber } from '@renderer/components/ui/input-number'
import { Input } from '@renderer/components/ui/input'

const AccountRounder = ({ typeAccount, amountRounders, setAmountRounders }) => {
  const data: AmountRounderSettingType =
    typeAccount === 'account1'
      ? amountRounders.account1.amountRounderSetting
      : amountRounders.account2.amountRounderSetting

  const [testRoundingValue, setTestRoundingValue] = useState('4789')
  const [showAlertMsg, setShowAlertMsg] = useState(false)
  const [numberTest, setNumberTest] = useState<string | null>(null)

  const updateData = (filed: string, value: number | string) => {
    setAmountRounders((prev) => {
      const updatedData = {
        ...prev,
        [typeAccount]: {
          ...prev[typeAccount],
          amountRounderSetting: {
            ...prev[typeAccount].amountRounderSetting,
            [filed]: value
          }
        }
      }
      return updatedData
    })
  }

  const testRounder = () => {
    if (!testRoundingValue) return

    const amount = parseFloat(testRoundingValue)
    const roundValue = Number(data.roundValue)
    let result = amount

    switch (data.roundType) {
      case 'roundDown':
        result = Math.floor(amount / roundValue) * roundValue
        break
      case 'roundUp':
        result = Math.ceil(amount / roundValue) * roundValue
        break
      case 'auto':
        result = Math.round(amount / roundValue) * roundValue
        break
    }

    setNumberTest(result.toString())
    setShowAlertMsg(true)
  }

  return (
    <div className="flex-1 m-5 border border-[#22262F] rounded-xl">
      <div className="flex flex-col gap-[12px] p-3">
        <div>{typeAccount}</div>
        <div className="flex items-center space-x-2">
          <SwitchCustom
            value={data.rounder}
            onCheckedChange={(value) => {
              updateData('rounder', Number(value))
            }}
          />
          <Label htmlFor="amount-rounder-enabled" className="text-white cursor-pointer">
            Enabled
          </Label>
        </div>

        {/* Settings Content */}
        <div className={`space-y-4 `}>
          {/* Round Type */}
          <div className="space-y-2">
            <Label className="text-white">Round Type</Label>
            <RadioGroup
              disabled={!data.rounder}
              value={data.roundType}
              onValueChange={(value) => updateData('roundType', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="roundDown" id="round-down" />
                <Label htmlFor="round-down" className="text-white cursor-pointer">
                  Round Down
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="roundUp" id="round-up" />
                <Label htmlFor="round-up" className="text-white cursor-pointer">
                  Round Up
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="text-white cursor-pointer">
                  Auto
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Rounding Number */}
          <div className="space-y-2">
            <Label className="text-white">Rounding Number</Label>
            <InputNumber
              disabled={!data.rounder}
              value={Number(data.roundValue)}
              onChange={(value) => {
                updateData('roundValue', Number(value).toString())
              }}
              min={1}
              max={7}
              precision={0}
              className="w-20"
            />
          </div>

          {/* Test Rounding */}
          <div className="text-sm mb-1">Test Rounding</div>
          <div className="relative">
            <Input
              disabled={!data.rounder}
              value={testRoundingValue}
              onChange={(e) => {
                const value = e.target.value
                if (/^\d*$/.test(value)) {
                  setTestRoundingValue(value)
                }
              }}
              button={{
                text: 'Test',
                onClick: testRounder
              }}
            />
            {showAlertMsg && (
              <div className="absolute top-0 right-12 mt-1 bg-blue-100 border border-blue-300 rounded px-2 py-1 text-sm text-blue-800">
                Result: {numberTest}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AccountRounder)
