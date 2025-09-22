import { Label } from '@renderer/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { SettingContext } from '@renderer/context/SettingContext'
import BoxLabel from '@renderer/layouts/BoxLabel'
import React, { useContext } from 'react'

const GameType = () => {
  const context = useContext(SettingContext)
  if (!context) return null

  const { gameType, setGameType } = context.gameType

  return (
    <BoxLabel label="Game Type" className="w-[301px] ">
      <RadioGroup
        value={gameType}
        onValueChange={setGameType}
        className="flex h-full justify-center items-center"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Running" id="Running" className="bg-white" />
          <Label htmlFor="Running">Running</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Today" id="Today" className="bg-white" />
          <Label htmlFor="Today">Today</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Early" id="Early" className="bg-white" />
          <Label htmlFor="Early">Early</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="None" id="None" className="bg-white" />
          <Label htmlFor="None">None</Label>
        </div>
      </RadioGroup>
    </BoxLabel>
  )
}

export default React.memo(GameType)
