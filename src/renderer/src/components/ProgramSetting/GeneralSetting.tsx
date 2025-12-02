import { useContext, useState } from 'react'
import { CheckCircle } from 'lucide-react'

import { SettingContext } from '@renderer/context/SettingContext'

import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export default function GeneralSetting() {
  const context = useContext(SettingContext)

  if (!context) return null

  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)

  const handleSaveSetting = () => {
    window.electron.ipcRenderer.send('SaveSettingWindow', {
      gameType: context.gameType.gameType,
      profitMax:
        isNaN(parseFloat(context.oddsTypeSetting.profitMax as string)) ||
        parseFloat(context.oddsTypeSetting.profitMax as string) > 1
          ? '1'
          : context.oddsTypeSetting.profitMax,
      profitMin:
        isNaN(parseFloat(context.oddsTypeSetting.profitMin as string)) ||
        parseFloat(context.oddsTypeSetting.profitMin as string) < -1
          ? '-1'
          : context.oddsTypeSetting.profitMin
    })

    setShowSaveSuccess(true)
    setMessageSuccess('Save successful!')
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 1500)
  }

  const handleCancel = () => {
    window.history.back()
  }

  return (
    <div className="bg-layout-color flex flex-col overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)]">
      <h1 className="text-lg font-bold mb-5 border-b pb-2 mt-8 border-b-[#22262F]">
        Game Configuration
      </h1>
      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-[#22262F]">
        <div className="flex flex-col p-4 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Odds Type</div>
            <div className="w-1/3 flex-shrink-0">
              <div>
                <Select defaultValue="Malay">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Malay">Malay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="grid grid-cols-1 gap-2 mb-2 border-b border-[#22262F]">
        <div className="flex flex-col space-y-6 p-4 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Profit Commission</div>
            <div className="w-1/3 flex items-center gap-2 flex-shrink-0">
              <div className="w-1/2">
                <div className="text-sm mb-[6px]">From</div>
                <InputNumber
                  precision={2}
                  min={-1}
                  max={1}
                  step={0.01}
                  allowNegative={true}
                  value={Number(context.oddsTypeSetting.profitMin)}
                  onChange={(value) => {
                    context.oddsTypeSetting.setProfitMin(value.toString())
                  }}
                />
              </div>
              <div className="w-1/2">
                <div className="text-sm mb-[6px]">To</div>
                <InputNumber
                  precision={2}
                  min={-1}
                  max={1}
                  step={0.01}
                  allowNegative={true}
                  value={Number(context.oddsTypeSetting.profitMax)}
                  onChange={(value) => {
                    context.oddsTypeSetting.setProfitMax(value.toString())
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-[#22262F]">
        <div className="flex flex-col space-y-6 p-4 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Game Type</div>
            <div className="w-1/3 flex items-center gap-2 flex-shrink-0">
              <div className="flex justify-between w-full">
                <RadioGroup
                  className="flex justify-between w-full"
                  value={context.gameType.gameType}
                  onValueChange={context.gameType.setGameType}
                >
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <RadioGroupItem value="Running" id="Running" />
                    <Label htmlFor="Running">Running</Label>
                  </div>
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <RadioGroupItem value="Today" id="Today" />
                    <Label htmlFor="Today">Today</Label>
                  </div>
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <RadioGroupItem value="Early" id="Early" />
                    <Label htmlFor="Early">Early</Label>
                  </div>
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <RadioGroupItem value="None" id="None" />
                    <Label htmlFor="None">None</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4 py-5 pr-5">
        <Button
          variant="bordered-white"
          className="border-red whitespace-nowrap w-28"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button onClick={handleSaveSetting} className="whitespace-nowrap w-28">
          Save
        </Button>
      </div>
      {showSaveSuccess && (
        <div className="fixed top-[5%] right-[2%] bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-pulse">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{messageSuccess}</span>
        </div>
      )}
    </div>
  )
}
