import { SettingContext } from '@renderer/context/SettingContext'
import BoxLabel from '@renderer/layouts/BoxLabel'
import React, { useContext, useMemo } from 'react'

const BetAmountRandomizer = () => {
  const context = useContext(SettingContext)
  if (!context) return null

  const {
    enableRandomizer,
    setRandomizerEnabled,
    fromRandomizer,
    setFromValue,
    toRandomizer,
    setToValue
  } = context.betAmountRandom

  const effectiveBetAmount = useMemo(() => {
    const fromPercentage = Number(fromRandomizer) / 100
    const toPercentage = Number(toRandomizer) / 100

    const fromBet = Math.round(500 * fromPercentage)
    const toBet = Math.round(500 * toPercentage)

    return `$${fromBet} - $${toBet}`
  }, [fromRandomizer, toRandomizer])

  return (
    <BoxLabel label="Bet Amount Randomizer" className="w-full py-3 pl-3">
      <div className="flex">
        <div className="flex-1 flex items-center">
          <input
            id="checkboxRandomizer"
            type="checkbox"
            checked={Boolean(enableRandomizer)}
            onChange={() => setRandomizerEnabled((prev) => Number(!prev))}
          />
          <label htmlFor="checkboxRandomizer" className="ml-2 cursor-pointer">
            Enable Randomizer
          </label>
        </div>
        <div className="flex-1 text-center">Effective Bet Amount: (e.g. $500)</div>
      </div>
      <div className="flex mt-5">
        <div className="flex-2 flex">
          <label htmlFor="" className="mr-2">
            From (0% - 100%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={fromRandomizer}
            onChange={(e) => {
              const value = e.target.value
              if (/^\d*$/.test(value)) {
                setFromValue(value)
              }
            }}
            disabled={!enableRandomizer}
            className={`w-14 outline-none border ${
              enableRandomizer ? 'border-gray-400' : 'border-gray-300 bg-gray-100'
            }`}
          />

          <label htmlFor="" className="ml-4 mr-2">
            To (100% - 200%)
          </label>
          <input
            type="number"
            min={100}
            max={200}
            step={1}
            value={toRandomizer}
            onChange={(e) => {
              const value = e.target.value
              if (/^\d*$/.test(value)) {
                setToValue(value)
              }
            }}
            disabled={!enableRandomizer}
            className={`w-14 outline-none border ${
              enableRandomizer ? 'border-gray-400' : 'border-gray-300 bg-gray-100'
            }`}
          />
        </div>
        <div
          className={`flex-1 font-extrabold text-center ${
            enableRandomizer ? 'text-blue-color' : 'text-gray-600'
          }`}
        >
          {effectiveBetAmount}
        </div>
      </div>
    </BoxLabel>
  )
}

export default React.memo(BetAmountRandomizer)
