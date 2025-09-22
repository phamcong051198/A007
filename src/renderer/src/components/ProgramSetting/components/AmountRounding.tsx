import React, { useState, useMemo, useContext } from 'react'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Label } from '@renderer/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { InputNumber } from '@renderer/components/ui/input-number'
import { Button } from '@renderer/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { SwitchCustom } from '@renderer/components/ui/switch'
import { Input } from '@renderer/components/ui/input'

interface AmountRoundingProps {
  isOpen?: boolean
  onToggle?: () => void
  account: 'account1' | 'account2'
}

interface AmountRounderSettingType {
  rounder: number
  roundType: string
  roundValue: string
}

const AmountRounding: React.FC<AmountRoundingProps> = ({
  isOpen = false,
  onToggle,
  account = 'account1'
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair, currentAccountPair } = Combination

  const [showAlertMsg, setShowAlertMsg] = useState(false)
  const [testRoundingValue, setTestRoundingValue] = useState('4879')
  const [numberTest, setNumberTest] = useState('')

  const dataAccountPair = useMemo(
    () => (account === 'account1' ? currentAccountPair.account1 : currentAccountPair.account2),
    [account, currentAccountPair]
  )

  const amountRounderSetting = useMemo(
    () =>
      dataAccountPair?.amountRounderSetting || {
        rounder: 0,
        roundType: 'roundDown',
        roundValue: 5
      },
    [dataAccountPair]
  )

  const updateRounder = (checked: boolean) => {
    const updatedSetting = { ...amountRounderSetting, rounder: checked ? 1 : 0 }
    updateAmountRounderSetting(updatedSetting)
  }

  const updateRoundType = (value: string) => {
    const updatedSetting = { ...amountRounderSetting, roundType: value }
    updateAmountRounderSetting(updatedSetting)
  }

  const updateRoundValue = (value: string) => {
    const updatedSetting = { ...amountRounderSetting, roundValue: value }
    updateAmountRounderSetting(updatedSetting)
  }

  const updateAmountRounderSetting = (newSetting: AmountRounderSettingType) => {
    if (!currentAccountPair) return

    const updatedAccountPair = {
      ...currentAccountPair,
      [account]: {
        ...dataAccountPair,
        amountRounderSetting: newSetting
      }
    }

    const updatedList = listAccountPair.map((pair) => {
      if (pair.id === currentAccountPair.id) {
        return updatedAccountPair
      }
      return pair
    })
    setListAccountPair(updatedList)
    Combination.setCurrentAccountPair(updatedAccountPair)
  }

  const testRounder = () => {
    if (!testRoundingValue) return

    const amount = parseFloat(testRoundingValue)
    const roundValue = Number(amountRounderSetting.roundValue)
    let result = amount

    switch (amountRounderSetting.roundType) {
      case 'roundDown':
        result = Math.floor(amount / roundValue) * roundValue
        break
      case 'roundUp':
        result = Math.ceil(amount / roundValue) * roundValue
        break
      case 'auto':
        result = Math.round(amount / roundValue) * roundValue
        break
    }

    setNumberTest(result.toString())
    setShowAlertMsg(true)
  }

  return (
    <div className="h-full">
      <div className={`h-full duration-300 ease-in-out z-10`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Amount Rounding</h3>

            <Button variant="plain-white" size="sm" onClick={onToggle}>
              {isOpen ? (
                <>
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 6.5L6 1.5L1 6.5"
                      stroke="#94979C"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              ) : (
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1.5L6 6.5L11 1.5"
                    stroke="#94979C"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </Button>
          </div>

          {/* Content */}
          <div
            className={`flex-1 overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="overflow-y-auto pt-5 h-full">
              <div className="space-y-4">
                {/* Enable Checkbox */}
                <div className="flex items-center space-x-2">
                  <SwitchCustom
                    checked={amountRounderSetting.rounder === 1}
                    onCheckedChange={(value) => {
                      updateRounder(value)
                    }}
                  />
                  <Label htmlFor="amount-rounder-enabled" className="text-white cursor-pointer">
                    Enabled
                  </Label>
                </div>

                {/* Settings Content */}
                <div className={`space-y-4 `}>
                  {/* Round Type */}
                  <div className="space-y-2">
                    <Label className="text-white">Round Type</Label>
                    <RadioGroup
                      disabled={!amountRounderSetting.rounder}
                      value={amountRounderSetting.roundType}
                      onValueChange={updateRoundType}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="roundDown" id="round-down" />
                        <Label htmlFor="round-down" className="text-white cursor-pointer">
                          Round Down
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="roundUp" id="round-up" />
                        <Label htmlFor="round-up" className="text-white cursor-pointer">
                          Round Up
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto" className="text-white cursor-pointer">
                          Auto
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Rounding Number */}
                  <div className="space-y-2">
                    <Label className="text-white">Rounding Number</Label>
                    <InputNumber
                      disabled={!amountRounderSetting.rounder}
                      value={Number(amountRounderSetting.roundValue)}
                      onChange={(value) => {
                        updateRoundValue(Number(value).toString())
                      }}
                      min={1}
                      max={7}
                      precision={0}
                      className="w-20"
                    />
                  </div>

                  {/* Test Rounding */}
                  <div className="text-sm mb-1">Test Rounding</div>
                  <div className="relative">
                    <Input
                      disabled={!amountRounderSetting.rounder}
                      value={testRoundingValue}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d*$/.test(value)) {
                          setTestRoundingValue(value)
                        }
                      }}
                      button={{
                        text: 'Test',
                        onClick: testRounder
                      }}
                    />
                    {showAlertMsg && (
                      <div className="absolute top-0 right-12 mt-1 bg-blue-100 border border-blue-300 rounded px-2 py-1 text-sm text-blue-800">
                        Result: {numberTest}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AmountRounding)
