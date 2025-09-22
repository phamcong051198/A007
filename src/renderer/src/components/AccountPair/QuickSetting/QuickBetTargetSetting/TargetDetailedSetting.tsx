import React, { useState } from 'react'

import BoxLabel from '@renderer/layouts/BoxLabel'
import { getBetText } from '@renderer/lib/getBetText'
import TargetBetTo from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting/TargetBetTo'
import TargetGameRange from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting/TargetGameRange'
import { CHECK_BOX_DETAIL_SETTING } from '@shared/renderer/constants'

const TargetDetailedSetting = ({ typeAccount, dataTarget, setDataTarget }) => {
  const dataAccountPair = dataTarget[typeAccount]
  const isBetSelected = dataAccountPair.generalSetting === 'BetSelected'

  const updateField = (field: string, value: number) => {
    setDataTarget((prev) => {
      return {
        ...prev,
        [typeAccount]: {
          ...prev[typeAccount],
          [field]: value
        }
      }
    })
  }

  const [keyCurrent, setKeyCurrent] = useState('')
  const [showBetTo, setShowBetTo] = useState(false)
  const [showGameRange, setShowGameRange] = useState(false)

  const handleShowPopup = ({ key, typeDetail }) => {
    setKeyCurrent(key)
    if (typeDetail == 'Range') {
      setShowBetTo(false)
      setShowGameRange(true)
    }
    if (typeDetail == 'BetTo') {
      setShowBetTo(true)
      setShowGameRange(false)
    }
  }

  const updateCheckBox = (key: string, value: boolean) => {
    updateField(key, Number(value))
  }
  return (
    <div className="relative">
      <BoxLabel label="Detailed Setting" className="w-full">
        <div className="flex p-3 gap-5">
          {['FT', 'Half'].map((category) => (
            <div key={category} className="flex-1 flex flex-col gap-1.5">
              {CHECK_BOX_DETAIL_SETTING.filter((cb) => cb.key.startsWith(category)).map(
                ({ key, label }) => {
                  const labelTextBetTo = getBetText(dataAccountPair[`${key}_Detail`]?.betTo)

                  return (
                    <div key={key} className="grid grid-cols-9 items-center">
                      <div className="flex gap-1 col-span-4">
                        <input
                          disabled={!isBetSelected}
                          type="checkbox"
                          className="cursor-pointer"
                          id={`Target${key}_${typeAccount}`}
                          checked={Boolean(dataAccountPair[key])}
                          onChange={(e) => updateCheckBox(key, e.target.checked)}
                        />
                        <label className="cursor-pointer" htmlFor={`Target${key}_${typeAccount}`}>
                          {label}
                        </label>
                      </div>
                      <div className="relative col-span-2">
                        <p
                          className={`${dataAccountPair[key] === 1 ? 'block' : 'hidden'} col-span-2 cursor-pointer underline italic ${isBetSelected ? 'text-blue-color' : ''}`}
                          onClick={() => handleShowPopup({ key, typeDetail: 'BetTo' })}
                        >
                          {key.includes('PK') ? '' : labelTextBetTo}
                        </p>
                        {showBetTo && keyCurrent == key && (
                          <TargetBetTo
                            typeAccount={typeAccount}
                            keyCurrent={keyCurrent}
                            label={label}
                            setShowBetTo={setShowBetTo}
                            dataTarget={dataTarget}
                            setDataTarget={setDataTarget}
                          />
                        )}
                      </div>
                      <div className="relative col-span-3">
                        <p
                          className={`${dataAccountPair[key] === 1 ? 'block' : 'hidden'} col-span-3 cursor-pointer text-end underline italic ${isBetSelected ? 'text-blue-color' : ''}`}
                          onClick={() => handleShowPopup({ key, typeDetail: 'Range' })}
                        >
                          {dataAccountPair[`${key}_Detail`]?.range.betAll === 1
                            ? 'Range: All'
                            : 'Range: '}
                        </p>
                        {showGameRange && keyCurrent == key && (
                          <TargetGameRange
                            typeAccount={typeAccount}
                            keyCurrent={keyCurrent}
                            label={label}
                            setShowGameRange={setShowGameRange}
                            dataTarget={dataTarget}
                            setDataTarget={setDataTarget}
                          />
                        )}
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          ))}
        </div>
      </BoxLabel>
      {!isBetSelected && (
        <div
          className="absolute top-[-9px] left-0 right-0 bottom-0 bg-layout-color opacity-45 z-50"
          style={{ width: '433px', height: '141px' }}
        />
      )}
    </div>
  )
}
export default React.memo(TargetDetailedSetting)
