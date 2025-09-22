import React, { useState } from 'react'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { NotificationError } from '@renderer/components/NotificationPopup/NotificationError'
import InformationCircle from '@renderer/icons/information-circle'
import { calculateRoundedValue } from '@renderer/lib/calculateRoundedValue'
import { AmountRounderSettingType } from '@shared/common/types'

const AmountRounder = ({ typeAccount, amountRounders, setAmountRounders }) => {
  const data: AmountRounderSettingType =
    typeAccount === 'account1'
      ? amountRounders.account1.amountRounderSetting
      : amountRounders.account2.amountRounderSetting

  const [testRoundingValue, setTestRoundingValue] = useState('4789')
  const [showAlertMsg, setShowAlertMsg] = useState(false)
  const [numberTest, setNumberTest] = useState<string | null>(null)

  const updateData = (filed: string, value: number | string) => {
    setAmountRounders((prev) => {
      const updatedData = {
        ...prev,
        [typeAccount]: {
          ...prev[typeAccount],
          amountRounderSetting: {
            ...prev[typeAccount].amountRounderSetting,
            [filed]: value
          }
        }
      }
      return updatedData
    })
  }

  const test = () => {
    const cleanedValueStr = testRoundingValue.replace(/^0+/, '') || '0'
    const value = parseInt(cleanedValueStr, 10)

    setTestRoundingValue(String(value))

    if (isNaN(value)) {
      setTestRoundingValue('0')
      setNumberTest('0')
      setShowAlertMsg(true)
      return
    }

    const roundedValue = calculateRoundedValue(
      value,
      testRoundingValue,
      Number(data.roundValue),
      data.roundType
    )
    setNumberTest(String(roundedValue))
    setShowAlertMsg(true)
  }
  return (
    <div className="relative">
      <BoxLabel label="Account Rounder" className="w-[300px]  ">
        <div className="flex border h-full">
          <div className="p-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`enabledRounder${typeAccount}`}
                checked={Boolean(data.rounder)}
                onChange={(e) => updateData('rounder', Number(e.target.checked))}
              />
              <label htmlFor={`enabledRounder${typeAccount}`} className="ml-2">
                Enabled
              </label>
            </div>
            <div className="pt-6 pl-6">
              <div className="">
                <div className="flex flex-col gap-2 mb-5 ">
                  <label className="flex items-center">
                    <input
                      disabled={!data.rounder}
                      type="radio"
                      name={`group${typeAccount}`}
                      value="roundDown"
                      checked={data.roundType === 'roundDown'}
                      onChange={() => updateData('roundType', 'roundDown')}
                    />
                    <span className="ml-1">Round Down</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      disabled={!data.rounder}
                      type="radio"
                      name={`group${typeAccount}`}
                      value="roundUp"
                      checked={data.roundType === 'roundUp'}
                      onChange={() => updateData('roundType', 'roundUp')}
                    />
                    <span className="ml-1">Round Up</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      disabled={!data.rounder}
                      type="radio"
                      name={`group${typeAccount}`}
                      value="auto"
                      checked={data.roundType === 'auto'}
                      onChange={() => updateData('roundType', 'auto')}
                    />
                    <span className="ml-1">Auto</span>
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="w-32 inline-block">Rounding Number</span>
                    <input
                      disabled={!data.rounder}
                      type="number"
                      pattern="[1-8]"
                      maxLength={1}
                      value={data.roundValue}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                          e.preventDefault()
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '') {
                          updateData('roundValue', '1')
                          return
                        }

                        if (/^[1-8]?$/.test(value)) {
                          updateData('roundValue', value)
                        }
                      }}
                      className="w-10 outline-none border border-gray-500 "
                    />
                  </div>
                  <div>
                    <span className="w-32 inline-block">Test Rounding</span>
                    <input
                      disabled={!data.rounder}
                      type="text"
                      maxLength={10}
                      value={testRoundingValue}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d*$/.test(value)) {
                          setTestRoundingValue(value)
                        }
                      }}
                      className="w-20 outline-none border-b-2 border-gray-400 focus:border-[#0000FF]"
                    />

                    <button
                      disabled={!data.rounder}
                      className={`text-sm underline ml-2 cursor-pointer ${data.rounder === 1 ? 'text-[#0000FF] ' : ''}`}
                      onClick={test}
                    >
                      Test Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BoxLabel>
      <NotificationError
        title="Message"
        messageError={`Rounding Result: ${numberTest}`}
        showAlertDialog={showAlertMsg}
        setShowAlertDialog={setShowAlertMsg}
        ReactElement={<InformationCircle className="text-blue-500  mr-1" />}
      />
    </div>
  )
}

export default React.memo(AmountRounder)
