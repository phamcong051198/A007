import { Label } from '@renderer/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import React from 'react'

interface Prop {
  strategy: string
  handleChangeStrategy: (e: string) => void
}

const ContraStrategy = ({ strategy, handleChangeStrategy }: Prop) => {
  return (
    <div className="flex items-center gap-5 ml-1 min-w-[420px]">
      <p>Contra Strategy: </p>
      <RadioGroup className="flex gap-5" value={strategy} onValueChange={handleChangeStrategy}>
        <div className="flex items-center gap-1">
          <RadioGroupItem value="auto" id="auto" />
          <Label htmlFor="auto" className="cursor-pointer">
            Auto
          </Label>
        </div>
        <div className="flex items-center gap-1">
          <RadioGroupItem value="manual" id="manual" />
          <Label htmlFor="manual" className="cursor-pointer">
            Manual (Right click to contra)
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}

export default React.memo(ContraStrategy)
