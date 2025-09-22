import React, { useContext, useMemo, useState } from 'react'
import BoxLabel from '@renderer/layouts/BoxLabel'
import BetTo from '@renderer/components/AccountPair/BetSetting/DetailedSetting/BetTo'
import GameRange from '@renderer/components/AccountPair/BetSetting/DetailedSetting/GameRange'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { getBetText } from '@renderer/lib/getBetText'
import { CHECK_BOX_DETAIL_SETTING } from '@shared/renderer/constants'

const DetailedSetting = ({ typeAccount }) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair, currentAccountPair } = Combination

  const dataAccountPair = useMemo(() => {
    return currentAccountPair[typeAccount] || {}
  }, [typeAccount, currentAccountPair])

  const isBetSelected = dataAccountPair.generalSetting === 'BetSelected'
  const updateField = (field: string, value: number) => {
    const updatedList = listAccountPair.map((item) => {
      if (item.id === currentAccountPair.id) {
        return {
          ...item,
          [typeAccount]: {
            ...item[typeAccount],
            [field]: value
          }
        }
      }
      return item
    })
    setListAccountPair(updatedList)
  }

  const [keyCurrent, setKeyCurrent] = useState('')
  const [showBetTo, setShowBetTo] = useState(false)
  const [showGameRange, setShowGameRange] = useState(false)

  const updateCheckBox = (key: string, value: boolean) => {
    updateField(key, Number(value))
  }

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
                          id={`${key}_${typeAccount}`}
                          checked={Boolean(dataAccountPair[key])}
                          onChange={(e) => updateCheckBox(key, e.target.checked)}
                        />
                        <label className="cursor-pointer" htmlFor={`${key}_${typeAccount}`}>
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
                          <BetTo
                            typeAccount={typeAccount}
                            keyCurrent={keyCurrent}
                            label={label}
                            setShowBetTo={setShowBetTo}
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
                          <GameRange
                            typeAccount={typeAccount}
                            keyCurrent={keyCurrent}
                            label={label}
                            setShowGameRange={setShowGameRange}
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

export default React.memo(DetailedSetting)
