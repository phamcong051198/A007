import React, { useState } from 'react'

import TargetGeneralSetting from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting/TargetGeneralSetting'
import TargetDetailedSetting from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting/TargetDetailedSetting'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { Label } from '@renderer/components/ui/label'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { DetailedSettingsSection } from './DetailedSettingSection'
import LineRangeSettingsModal from '../modal/LineRangeSettingsModal'

const TargetAccount = ({ typeAccount, target, setTarget, dataTarget, setDataTarget }) => {
  const labelText = typeAccount == 'account1' ? 'Bet Target A' : 'Bet Target B'
  const data = dataTarget[`${typeAccount}`]
  console.log('🚀 ~ TargetAccount ~ data:', data)
  const [showPopupLineRangeSetting, setShowPopupLineRangeSetting] = useState(false)
  const [currentLineKey, setCurrentLineKey] = useState('')
  const updateGeneralSetting = (value: string) => {
    setDataTarget((prev) => {
      return {
        ...prev,
        [typeAccount]: {
          ...prev[typeAccount],
          generalSetting: value
        }
      }
    })
  }
  const handleShowPopupLineRange = (key: string) => {
    setCurrentLineKey(key)
    setShowPopupLineRangeSetting(true)
  }

  return (
    <div className="flex-1 m-5 border border-[#22262F] rounded-xl">
      <div className="flex cursor-pointer gap-2 items-center bg-[#13161B]  p-3 rounded-b-none rounded-xl">
        <Checkbox
          id={`target${typeAccount}`}
          checked={target}
          onCheckedChange={setTarget}
          className="cursor-pointer"
        />
        <label htmlFor={`target${typeAccount}`} className="cursor-pointer">
          {labelText}
        </label>
      </div>
      <div className="flex flex-col gap-[12px] p-3">
        <div>General settings</div>
        <RadioGroup
          disabled={!target}
          onValueChange={(value) => {
            updateGeneralSetting(value)
          }}
          className="grid grid-cols-2 items-center gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="BetAll"
              checked={data?.generalSetting === 'BetAll'}
              id={`BetAllTarget_${typeAccount}`}
            />
            <Label htmlFor={`BetAllTarget_${typeAccount}`} className="text-gray-300">
              Bet All
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="NoBet"
              id={`NoBetTarget_${typeAccount}`}
              checked={data?.generalSetting === 'NoBet'}
            />
            <Label htmlFor={`NoBetTarget_${typeAccount}`} className="text-gray-300">
              No Bet
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="BetSelected"
              id={`SelectBetTarget_${typeAccount}`}
              checked={data?.generalSetting === 'BetSelected'}
            />
            <Label htmlFor={`SelectBetTarget_${typeAccount}`} className="text-gray-300">
              Bet Selected
            </Label>
          </div>
        </RadioGroup>
        <DetailedSettingsSection
          disable={!target}
          typeAccount={typeAccount}
          dataTarget={dataTarget}
          setDataTarget={setDataTarget}
          handleShowPopupLineRange={handleShowPopupLineRange}
        />
        {showPopupLineRangeSetting && (
          <LineRangeSettingsModal
            setShowAmountRounderSetting={setShowPopupLineRangeSetting}
            typeAccount={typeAccount}
            lineKey={currentLineKey}
          />
        )}
      </div>
    </div>
  )
}
export default React.memo(TargetAccount)
