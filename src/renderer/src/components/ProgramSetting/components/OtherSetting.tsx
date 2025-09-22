import React, { useContext } from 'react'
import { BetSettingContext } from '@renderer/context/BetSettingContext'
import { Checkbox } from '@renderer/components/ui/checkbox'

const OtherSetting = () => {
  const context = useContext(BetSettingContext)
  if (!context) return null

  const { otherSetting, setOtherSetting } = context.OtherSetting
  const isOther = !!otherSetting.isOther

  const toggleOthers = () => setOtherSetting({ ...otherSetting, isOther: isOther ? 0 : 1 })

  const toggleBet = (key: keyof typeof otherSetting, exclusiveKey?: keyof typeof otherSetting) => {
    if (!isOther) return
    const updated = {
      ...otherSetting,
      [key]: otherSetting[key] ? 0 : 1,
      ...(exclusiveKey && !otherSetting[key] ? { [exclusiveKey]: 0 } : {})
    }
    setOtherSetting(updated)
  }

  // Configuration for checkbox items
  const checkboxConfigs = [
    {
      id: 'betUnderFirstId',
      name: 'betUnderFirst',
      label: 'Bet Under First',
      key: 'isBetUnderSelected' as keyof typeof otherSetting,
      exclusive: 'isBetOverSelected' as keyof typeof otherSetting,
      checked: !!otherSetting.isBetUnderSelected,
      disabled: !isOther,
      onChange: () => toggleBet('isBetUnderSelected', 'isBetOverSelected')
    },
    {
      id: 'betPutFirstId',
      name: 'betPutFirst',
      label: 'Bet Put First',
      key: 'isBetPutSelected' as keyof typeof otherSetting,
      exclusive: 'isBetEatSelected' as keyof typeof otherSetting,
      checked: !!otherSetting.isBetPutSelected,
      disabled: !isOther,
      onChange: () => toggleBet('isBetPutSelected', 'isBetEatSelected')
    },
    {
      id: 'betOverFirstId',
      name: 'betOverFirst',
      label: 'Bet Over First',
      key: 'isBetOverSelected' as keyof typeof otherSetting,
      exclusive: 'isBetUnderSelected' as keyof typeof otherSetting,
      checked: !!otherSetting.isBetOverSelected,
      disabled: !isOther,
      onChange: () => toggleBet('isBetOverSelected', 'isBetUnderSelected')
    },
    {
      id: 'betEatFirstId',
      name: 'betEatFirst',
      label: 'Bet Eat First',
      key: 'isBetEatSelected' as keyof typeof otherSetting,
      exclusive: 'isBetPutSelected' as keyof typeof otherSetting,
      checked: !!otherSetting.isBetEatSelected,
      disabled: !isOther,
      onChange: () => toggleBet('isBetEatSelected', 'isBetPutSelected')
    }
  ] as const

  return (
    <div className="grid grid-cols-1 gap-4 mb-4 border-b border-t border-b-[#22262F] border-t-[#22262F]">
      <div className="flex flex-col space-y-6 p-4 pl-0">
        <div className="flex">
          <div className="w-1/3">Other Setting</div>
          <div className="w-2/3 flex  gap-2">
            <div className="grid grid-cols-2 gap-4 w-1/2">
              {checkboxConfigs.map((config) => (
                <label key={config.id} className="inline-flex items-center">
                  <Checkbox
                    name={config.name}
                    id={config.id}
                    checked={config.checked}
                    disabled={config.disabled}
                    onCheckedChange={config.onChange}
                  />
                  <span className="ml-2">{config.label}</span>
                </label>
              ))}
            </div>
            <div className="w-1/2">
              <label className="inline-flex items-center">
                <Checkbox
                  name="otherId"
                  id="otherId"
                  checked={isOther}
                  onCheckedChange={toggleOthers}
                />
                <span className="ml-2">Others</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(OtherSetting)
