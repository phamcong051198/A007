import React from 'react'
import { Checkbox } from '@renderer/components/ui/checkbox'

const SettingCheckBox = ({ settings, handleCheckboxChange }) => {
  return (
    <div className="flex gap-2 w-[260px]">
      <div className="flex items-center mr-[20px]">
        <Checkbox
          id="clear"
          checked={Boolean(settings.clearWhenOver100)}
          onCheckedChange={handleCheckboxChange('clearWhenOver100')}
        />
        <label htmlFor="clear" className="ml-[8px] cursor-pointer">
          Clear when {'>'} 100 bets
        </label>
      </div>
      <div className="flex items-center cursor-pointer">
        <Checkbox
          id="scroll"
          checked={Boolean(settings.enableScroll)}
          onCheckedChange={handleCheckboxChange('enableScroll')}
        />
        <label htmlFor="scroll" className="ml-[8px] cursor-pointer">
          Scroll
        </label>
      </div>
    </div>
  )
}

export default React.memo(SettingCheckBox)
