import React, { useContext } from 'react'
import { BetSettingContext } from '@renderer/context/BetSettingContext'
import RangeSlider from '@renderer/components/BetSetting/RangeSlider'

const InputRangePlatform = () => {
  const context = useContext(BetSettingContext)
  if (!context) return null

  const { listRangePlatform, setListRangePlatform } = context.RangePlatform

  const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    setListRangePlatform((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], valueRange: newValue }
      return updated
    })
  }

  const handleDecrease = (index: number) => () => {
    setListRangePlatform((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        valueRange: Math.max(0, updated[index].valueRange - 1)
      }
      return updated
    })
  }

  const handleIncrease = (index: number) => () => {
    setListRangePlatform((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        valueRange: Math.min(6, updated[index].valueRange + 1)
      }
      return updated
    })
  }

  return (
    <div className="h-full ">
      {listRangePlatform.map((item, index) => (
        <RangeSlider
          key={item.id}
          label={item.platform}
          value={item.valueRange}
          onChange={handleChange(index)}
          onDecrease={handleDecrease(index)}
          onIncrease={handleIncrease(index)}
        />
      ))}
    </div>
  )
}
export default React.memo(InputRangePlatform)
