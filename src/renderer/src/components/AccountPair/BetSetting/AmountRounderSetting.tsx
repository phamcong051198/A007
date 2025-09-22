import React from 'react'
import { Dispatch, SetStateAction, useContext, useMemo, useState } from 'react'
import { calculateRoundedValue } from '@renderer/lib/calculateRoundedValue'
import { AccountPairContext } from '@renderer/context/AccountPairContext'

import { NotificationError } from '@renderer/components/NotificationPopup/NotificationError'
import { Modal } from '@renderer/components/AccountPair/QuickSetting/Modal'
import { Button } from '@renderer/components/ui/button'
import BoxLabel from '@renderer/layouts/BoxLabel'
import InformationCircle from '@renderer/icons/information-circle'
import { AmountRounderSettingType } from '@shared/common/types'

const AmountRounderSetting = ({
  account,
  setShowAmountRounderSetting
}: {
  account: string
  setShowAmountRounderSetting: Dispatch<SetStateAction<boolean>>
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair, currentAccountPair } = Combination

  const dataAccountPair = useMemo(
    () => (account === 'account1' ? currentAccountPair.account1 : currentAccountPair.account2),
    [account, currentAccountPair]
  )
  const [amountRounderSetting, setAmountRounderSetting] = useState(
    dataAccountPair.amountRounderSetting
  )
  const [testRoundingValue, setTestRoundingValue] = useState('4879')
  const [roundType, setRoundType] = useState(() => amountRounderSetting.roundType)
  const [roundValue, setRoundValue] = useState(() => Number(amountRounderSetting.roundValue))
  const [showAlertMsg, setShowAlertMsg] = useState(false)
  const [numberTest, setNumberTest] = useState<string | null>(null)

  const updateField = (field: string, value: string | number) => {
    setAmountRounderSetting((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const updateRounder = (value: boolean) => {
    updateField('rounder', Number(value))
  }

  const updateRoundType = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateField('roundType', value)
    setRoundType(value)
  }

  const updateRoundValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valueEvent = Number(event.target.value)
    let value = '2'
    if (valueEvent >= 1 && valueEvent <= 8) {
      value = String(valueEvent)
    } else if (valueEvent < 1) {
      value = '1'
    } else if (valueEvent > 8) {
      value = '8'
    }

    updateField('roundValue', value)
    setRoundValue(Number(value))
  }

  const testRounder = () => {
    const cleanedValueStr = testRoundingValue.replace(/^0+/, '') || '0'
    const value = parseInt(cleanedValueStr, 10)

    setTestRoundingValue(String(value))

    if (isNaN(value)) {
      setTestRoundingValue('0')
      setNumberTest('0')
      setShowAlertMsg(true)
      return
    }

    const roundedValue = calculateRoundedValue(value, testRoundingValue, roundValue, roundType)

    setNumberTest(roundedValue + '')
    setShowAlertMsg(true)
  }

  const save = () => {
    const updateField = (field: string, value: AmountRounderSettingType) => {
      const updatedList = listAccountPair.map((item) => {
        if (item.id === currentAccountPair.id) {
          return {
            ...item,
            [account]: {
              ...item[account],
              [field]: value
            }
          }
        }
        return item
      })
      setListAccountPair(updatedList)
    }
    updateField('amountRounderSetting', amountRounderSetting)
    setShowAmountRounderSetting(false)
  }

  return (
    <Modal title="Amount Rounder Setting" onClose={() => setShowAmountRounderSetting(false)}>
      <div className="flex flex-col bg-layout-color h-[280px] rounded-b-xl pt-2">
        <div className="flex h-full p-2 relative">
          <BoxLabel label="Amount Rounder" className="w-[300px]">
            <div className="p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="AmountRounder"
                  checked={Boolean(amountRounderSetting.rounder)}
                  onChange={(e) => updateRounder(e.target.checked)}
                />
                <label htmlFor="AmountRounder" className="ml-2 cursor-pointer">
                  Enabled
                </label>
              </div>
              <div className="pl-6 pt-6">
                <div className="">
                  <div className="flex flex-col gap-1 mb-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="group1"
                        value="roundDown"
                        checked={amountRounderSetting.roundType === 'roundDown'}
                        onChange={updateRoundType}
                      />
                      <span className="ml-1 cursor-pointer">Round Down</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="group1"
                        value="roundUp"
                        checked={amountRounderSetting.roundType === 'roundUp'}
                        onChange={updateRoundType}
                      />
                      <span className="ml-1 cursor-pointer">Round Up</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="group1"
                        value="auto"
                        checked={amountRounderSetting.roundType === 'auto'}
                        onChange={updateRoundType}
                      />
                      <span className="ml-1 cursor-pointer">Auto</span>
                    </label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="w-32 inline-block">Rounding Number</span>
                      <input
                        type="number"
                        value={amountRounderSetting.roundValue}
                        onChange={updateRoundValue}
                        className="border border-gray-500 w-10 outline-none"
                      />
                    </div>
                    <div>
                      <span className="w-32 inline-block">Test Rounding</span>
                      <input
                        type="text"
                        maxLength={10}
                        value={testRoundingValue}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            setTestRoundingValue(value)
                          }
                        }}
                        className="border-b-2 border-gray-500 w-20 focus:border-[#0000FF] outline-none"
                      />
                      <span className="text-[#0000FF] text-sm ml-2 underline" onClick={testRounder}>
                        Test Now
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BoxLabel>
          {amountRounderSetting.rounder == 0 && (
            <div
              className="bg-layout-color absolute opacity-50 pointer-events-auto right-[11px] top-[57px] z-50"
              style={{ width: '291px', height: '169px' }}
            />
          )}
        </div>
        <div className="flex justify-end rounded-b-xl">
          <Button
            variant="outline"
            className="bg-white border border-gray-400 border-solid h-6 w-20 hover:border-blue-500 leading-none mr-2 my-2 px-8"
            onClick={save}
          >
            OK
          </Button>
        </div>
      </div>
      <NotificationError
        title="Message"
        messageError={`Rounding Result: ${numberTest}`}
        showAlertDialog={showAlertMsg}
        setShowAlertDialog={setShowAlertMsg}
        ReactElement={<InformationCircle className="text-blue-500 mr-1" />}
      />
    </Modal>
  )
}

export default React.memo(AmountRounderSetting)
