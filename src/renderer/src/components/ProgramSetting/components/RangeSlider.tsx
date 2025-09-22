import ArrowLeft from '@renderer/icons/arrow-left'
import ArrowRight from '@renderer/icons/arrow-right'
import * as Slider from '@radix-ui/react-slider'
import React from 'react'

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

interface RangeSliderProps {
  label: string
  value: number
  onChange: (value: number[]) => void
}

const RangeSlider = ({ label, value, onChange }: RangeSliderProps) => {
  const buildTarget = import.meta.env.VITE_BUILD_TARGET

  let theme = 'blue'

  switch (buildTarget) {
    case 'BSoft':
      theme = 'blue'
      break
    case 'BSoft-switch':
      theme = 'green'
      break
    case 'BSoft-corners':
      theme = 'purple'
      break
    default:
      theme = 'blue'
  }

  const themeClasses = {
    blue: '#155EEF',
    green: '#14B800',
    purple: '#7F56D9'
  }

  const thumbClasses = {
    blue: 'border-[#155EEF] data-[state=open]:ring-[#155EEF]',
    green: 'border-[#14B800] data-[state=open]:ring-[#14B800]',
    purple: 'border-[#7F56D9] data-[state=open]:ring-[#7F56D9]'
  }

  return (
    <div className="flex items-center mt-3">
      <p className="font-bold w-1/3">
        {label}
        <span
          className={cn(
            'ml-3',
            theme === 'blue'
              ? 'text-[#155EEF]'
              : theme === 'green'
                ? 'text-[#14B800]'
                : 'text-[#7F56D9]'
          )}
        >
          {value}
        </span>
      </p>
      <div className=" flex items-center w-1/3">
        <p className="text-xs font-semibold text-gray-400 mr-3">0</p>

        <div className="flex-1 flex items-center relative">
          <div className="flex-1 relative mx-1">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[value]}
              onValueChange={onChange}
              max={7}
              min={0}
              step={1}
            >
              <Slider.Track className="bg-gray-400 relative grow rounded-full h-[6px]">
                <Slider.Range
                  className="absolute rounded-full h-full"
                  style={{ backgroundColor: themeClasses[theme] }}
                />
              </Slider.Track>
              <Slider.Thumb
                className={cn(
                  'block w-5 h-5 bg-white rounded-full border-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer',
                  thumbClasses[theme]
                )}
                aria-label="Volume"
              />
            </Slider.Root>
          </div>
        </div>
        <p className="text-xs font-semibold text-gray-400 ml-3">7</p>
      </div>
    </div>
  )
}

export default React.memo(RangeSlider)
