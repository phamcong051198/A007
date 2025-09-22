import ArrowLeft from '@renderer/icons/arrow-left'
import ArrowRight from '@renderer/icons/arrow-right'
import React from 'react'

interface RangeSliderProps {
  label: string
  value: number
  onDecrease: () => void
  onIncrease: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
const RangeSlider = ({ label, value, onDecrease, onIncrease, onChange }: RangeSliderProps) => {
  return (
    <div className="flex items-center mx-4 mt-3">
      <p className="w-36 font-bold">
        {label}
        <span className="text-blue-600 ml-3">{value}</span>
      </p>
      <div className="flex-1 flex items-center">
        <p className="text-xs font-semibold text-gray-500">Bet First</p>
        <div className="flex-1 flex items-center border-t border-white bg-[#E8E8E8] mx-2">
          <button onClick={onDecrease} className="bg-gray-200 hover:bg-gray-300 px-[2px]">
            <ArrowLeft className="text-[#888888] size-[13px]" />
          </button>
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={value}
            onChange={onChange}
            className="w-full appearance-none h-4 bg-transparent"
            style={{ WebkitAppearance: 'none' }}
          />
          <button onClick={onIncrease} className="bg-gray-200 hover:bg-gray-300 px-[2px]">
            <ArrowRight className="text-[#888888] size-[13px]" />
          </button>
        </div>
        <p className="text-xs font-semibold text-gray-500">Bet Last</p>
      </div>
    </div>
  )
}
export default React.memo(RangeSlider)
