import React, { useContext } from 'react'
import { BetSettingContext } from '@renderer/context/BetSettingContext'
import RangeSlider from './RangeSlider'

const InputRangePlatform = () => {
  const context = useContext(BetSettingContext)
  if (!context) return null

  const { listRangePlatform, setListRangePlatform } = context.RangePlatform

  const handleChange = (index: number) => (value: number[]) => {
    const newValue = value[0]
    setListRangePlatform((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], valueRange: newValue }
      return updated
    })
  }

  return (
    <div className="">
      {listRangePlatform.map((item, index) => (
        <RangeSlider
          key={item.id}
          label={item.platform}
          value={item.valueRange}
          onChange={handleChange(index)}
        />
      ))}
    </div>
  )
}
export default React.memo(InputRangePlatform)
