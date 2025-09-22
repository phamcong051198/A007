import { Button } from '@renderer/components/ui/button'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { updateObject } from '@renderer/lib/updateBetTo'
import { BetToType } from '@shared/common/types'
import { HDP_OPTIONS } from '@shared/renderer/constants'

import React, { useContext, useState } from 'react'

const BetTo = ({ typeAccount, keyCurrent, label, setShowBetTo }) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair, currentAccountPair } = Combination

  const [dataBetTo, setDataBetTo] = useState<BetToType>(() => {
    return currentAccountPair[typeAccount][`${keyCurrent}_Detail`].betTo || {}
  })

  const updateHdp = (field: string, value: number) => {
    if (field === 'selectAll') {
      const newState = HDP_OPTIONS.reduce((acc, hdp) => {
        acc[hdp.key] = value
        return acc
      }, {} as BetToType)

      setDataBetTo({
        ...newState,
        selectAll: value
      })
    } else {
      const updatedData = { ...dataBetTo, [field]: value }
      const allSelected = HDP_OPTIONS.every((hdp) => updatedData[hdp.key])
      updatedData.selectAll = Number(allSelected)

      setDataBetTo(updatedData)
    }
  }

  const save = () => {
    updateObject(dataBetTo)

    const updateField = () => {
      const updatedList = listAccountPair.map((item) => {
        if (item.id === currentAccountPair.id) {
          return {
            ...item,
            [typeAccount]: {
              ...item[typeAccount],
              [`${keyCurrent}_Detail`]: {
                ...item[typeAccount][`${keyCurrent}_Detail`],
                betTo: dataBetTo
              }
            }
          }
        }
        return item
      })

      setListAccountPair(updatedList)
    }
    updateField()
    setShowBetTo((prev: boolean) => !prev)
  }
  return (
    <div className="absolute w-[400px] h-[350px] left-0 bottom-4 bg-layout-color z-[60] border border-gray-400 flex  flex-col shadow-2xl">
      <p
        className="text-start font-bold underline text-red-color leading-none p-[1px] cursor-pointer mb-3"
        onClick={() => setShowBetTo((prev: boolean) => !prev)}
      >
        Close
      </p>
      <div className="flex-1">
        <BoxLabel label={`${label} - Bet to...`} className="w-full pt-3 px-1 flex flex-col">
          <div
            className="w-full border border-gray-400 bg-white grid grid-flow-col px-[1px] pb-4"
            style={{ gridTemplateRows: 'repeat(17, minmax(0, 1fr))' }}
          >
            {HDP_OPTIONS.map((hdp: { key: string; label: string }) => (
              <div
                key={`${hdp.key}_${typeAccount}`}
                className="flex items-center leading-none pt-[1px]"
              >
                <input
                  type="checkbox"
                  id={`${hdp.key}_${typeAccount}`}
                  checked={Boolean(dataBetTo[hdp.key])}
                  onChange={(e) => updateHdp(hdp.key, Number(e.target.checked))}
                />
                <label
                  htmlFor={`${hdp.key}_${typeAccount}`}
                  className={`ml-[1px] px-1 pb-[1px] leading-none cursor-pointer ${dataBetTo[hdp.key] == 1 ? 'bg-green-400' : ''}`}
                >
                  {hdp.label}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-1 pb-[3px] flex items-center gap-1 leading-none">
            <input
              type="checkbox"
              id={`selectAllBetTo_${typeAccount}`}
              checked={Boolean(dataBetTo.selectAll)}
              onChange={(e) => updateHdp('selectAll', Number(e.target.checked))}
            />
            <label htmlFor={`selectAllBetTo_${typeAccount}`}>Select All</label>
          </div>
        </BoxLabel>
      </div>
      <div className="flex justify-center items-center py-2">
        <Button
          variant="outline"
          className="bg-white border border-solid border-gray-400 hover:border-blue-500 px-8 leading-none h-[20px] w-24 "
          onClick={save}
        >
          OK
        </Button>
      </div>
    </div>
  )
}
export default React.memo(BetTo)
