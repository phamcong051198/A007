import React, { useContext } from 'react'
import CheckboxItem from '@renderer/components/BetSetting/CheckboxItem'
import { BetSettingContext } from '@renderer/context/BetSettingContext'
import BoxLabel from '@renderer/layouts/BoxLabel'

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

  const checkboxConfigs = [
    {
      id: 'betUnderFirstId',
      label: 'Bet Under First',
      key: 'isBetUnderSelected',
      exclusive: 'isBetOverSelected'
    },
    {
      id: 'betPutFirstId',
      label: 'Bet Put First',
      key: 'isBetPutSelected',
      exclusive: 'isBetEatSelected'
    },
    {
      id: 'betOverFirstId',
      label: 'Bet Over First',
      key: 'isBetOverSelected',
      exclusive: 'isBetUnderSelected'
    },
    {
      id: 'betEatFirstId',
      label: 'Bet Eat First',
      key: 'isBetEatSelected',
      exclusive: 'isBetPutSelected'
    }
  ] as const

  return (
    <BoxLabel label="Other Setting" className="w-full">
      <div className="pl-10 grid grid-cols-4 mt-3 mb-4">
        <div>
          <div className="flex gap-1">
            <input
              type="checkbox"
              id="otherId"
              checked={isOther}
              onChange={toggleOthers}
              className="cursor-pointer"
            />
            <label htmlFor="otherId" className="cursor-pointer">
              Others
            </label>
          </div>
        </div>
        {[0, 1].map((col) => (
          <div key={col}>
            {checkboxConfigs.slice(col * 2, col * 2 + 2).map(({ id, label, key, exclusive }) => (
              <CheckboxItem
                key={id}
                id={id}
                label={label}
                checked={!!otherSetting[key]}
                disabled={!isOther}
                onChange={() => toggleBet(key, exclusive)}
              />
            ))}
          </div>
        ))}
      </div>
    </BoxLabel>
  )
}

export default React.memo(OtherSetting)
