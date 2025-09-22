import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { SettingContext } from '@renderer/context/SettingContext'
import BoxLabel from '@renderer/layouts/BoxLabel'
import React, { useContext } from 'react'

const OddsTypeSetting = () => {
  const context = useContext(SettingContext)
  if (!context) return null
  const { profitMin, setProfitMin, profitMax, setProfitMax } = context.oddsTypeSetting

  return (
    <BoxLabel label="Odds Type Setting" className="w-full">
      <div className="flex flex-col my-4 mx-3 gap-2">
        <div className="flex  items-center justify-between">
          <div>Odds Type</div>
          <Select defaultValue="Malay">
            <SelectTrigger className="w-[156px] h-6 bg-white rounded-none border-gray-500 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-gray-500 focus:ring-0">
              <SelectItem value="Malay" className="h-7 pl-3">
                Malay
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className=" flex items-center justify-between">
          <p className="font-bold">Profit Commission</p>
          <input
            type="number"
            id="quantity"
            min={'-1.00'}
            max={'1.00'}
            pattern="[0-9]*"
            onKeyDown={(e) => {
              if (['e', 'E', '+', ','].includes(e.key)) {
                e.preventDefault()
              }
            }}
            name="quantity"
            step={0.01}
            className="pl-[2px] w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 "
            value={profitMin}
            onChange={(event) => {
              setProfitMin(event.target.value)
            }}
          />
          <p className="font-bold">to</p>
          <input
            type="number"
            id="quantity"
            min={'-1.00'}
            max={'1.00'}
            pattern="[0-9]*"
            onKeyDown={(e) => {
              if (['e', 'E', '+', ','].includes(e.key)) {
                e.preventDefault()
              }
            }}
            name="quantity"
            step={0.01}
            className="pl-[2px] w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 "
            value={profitMax}
            onChange={(event) => {
              setProfitMax(event.target.value)
            }}
          />
        </div>
      </div>
    </BoxLabel>
  )
}

export default React.memo(OddsTypeSetting)
