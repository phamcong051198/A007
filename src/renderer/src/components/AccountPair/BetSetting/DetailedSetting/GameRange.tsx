import React, { useContext, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@renderer/components/ui/button'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import BoxLabel from '@renderer/layouts/BoxLabel'

import { handleDataTableMinutes } from '@renderer/lib/handleDataTableMinutes'
import { handleDataRange } from '@renderer/lib/handleDataRange'
import { RangeType, RowType } from '@shared/common/types'

const GameRange = ({ typeAccount, keyCurrent, label, setShowGameRange }) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair, currentAccountPair } = Combination

  const [dataRange, setDataRange] = useState<RangeType>(() => {
    return currentAccountPair[typeAccount][`${keyCurrent}_Detail`].range || {}
  })

  const updateRange = (field: string, value: string | number) => {
    setDataRange((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const [rows, setRows] = useState<RowType[]>(() => {
    const initialRows = (dataRange.arrayMinutes || []).map((item) => ({
      id: uuidv4(),
      minutesFrom: item.minutesFrom || '',
      minutesTo: item.minutesTo || ''
    }))
    initialRows.push({
      id: uuidv4(),
      minutesFrom: '',
      minutesTo: ''
    })

    return initialRows
  })

  const handleInputChange = (index: number, field: 'minutesFrom' | 'minutesTo', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) {
      return
    }

    setRows((prev) => {
      const updatedRows = [...prev]
      updatedRows[index] = { ...updatedRows[index], [field]: value }

      if (index === prev.length - 1 && value !== '') {
        updatedRows.push({ id: uuidv4() as string, minutesFrom: '', minutesTo: '' })
      }

      return updatedRows
    })
  }

  const save = () => {
    const dataArrayMinutes = handleDataTableMinutes(rows)
    const dataRangeUpdate = handleDataRange({ ...dataRange, arrayMinutes: dataArrayMinutes })

    const updateField = () => {
      const updatedList = listAccountPair.map((item) => {
        if (item.id === currentAccountPair.id) {
          return {
            ...item,
            [typeAccount]: {
              ...item[typeAccount],
              [`${keyCurrent}_Detail`]: {
                ...item[typeAccount][`${keyCurrent}_Detail`],
                range: dataRangeUpdate
              }
            }
          }
        }
        return item
      })
      setListAccountPair(updatedList)
    }
    updateField()
    setShowGameRange((prev: boolean) => !prev)
  }
  return (
    <div className="absolute w-[300px] h-[400px] left-[12px] bottom-4 bg-layout-color z-[60] border border-gray-400 flex flex-col shadow-2xl">
      <div>
        <p
          className="text-start font-bold underline text-red-color leading-none p-[1px] cursor-pointer mb-3"
          onClick={() => setShowGameRange((prev: boolean) => !prev)}
        >
          Close
        </p>

        <p className=" text-center font-bold text-lg text-blue-900">{`${label} - Game Range`}</p>
        <div className="flex items-center gap-1 px-8 pb-5">
          <input
            type="checkbox"
            id={`betAll_${typeAccount}`}
            checked={Boolean(dataRange.betAll)}
            onChange={(e) => updateRange('betAll', Number(e.target.checked))}
          />
          <label htmlFor={`betAll_${typeAccount}`}>Bet All</label>
        </div>
      </div>
      <div className="flex-1 px-4">
        <BoxLabel label="Game Type" className="w-full p-2 flex flex-col">
          <div className="grid grid-flow-col grid-rows-2 justify-items-start gap-2 py-2">
            <div className="flex justify-center gap-1 pl-10">
              <input
                disabled={dataRange.betAll === 1}
                type="checkbox"
                checked={Boolean(dataRange.today)}
                id={`today_${typeAccount}`}
                onChange={(e) => updateRange('today', Number(e.target.checked))}
              />
              <label htmlFor={`today_${typeAccount}`}>Today</label>
            </div>
            <div className="flex justify-center gap-1 pl-10">
              <input
                disabled={dataRange.betAll === 1}
                type="checkbox"
                checked={Boolean(dataRange.running)}
                id={`running_${typeAccount}`}
                onChange={(e) => updateRange('running', Number(e.target.checked))}
              />
              <label htmlFor={`running_${typeAccount}`}>Running</label>
            </div>
            <div className="flex justify-center gap-1 pl-10">
              <input
                disabled={dataRange.betAll === 1}
                type="checkbox"
                checked={Boolean(dataRange.early)}
                id={`early_${typeAccount}`}
                onChange={(e) => updateRange('early', Number(e.target.checked))}
              />
              <label htmlFor={`early_${typeAccount}`}>Early</label>
            </div>
            <div className="flex justify-center gap-1 pl-10">
              <input
                disabled={dataRange.betAll == 0 && dataRange.running == 1 ? false : true}
                type="checkbox"
                checked={Boolean(dataRange.allMinutes)}
                id={`allMinutes_${typeAccount}`}
                onChange={(e) => updateRange('allMinutes', Number(e.target.checked))}
              />
              <label htmlFor={`allMinutes_${typeAccount}`}>All Minutes</label>
            </div>
          </div>

          <div className="bg-white border border-gray-600  grow h-[140px] p-[1px] ">
            <div className="custom-scrollbar overflow-auto h-full">
              <table className="bg-white m-0 border-none custom-table">
                <thead>
                  <tr>
                    <th scope="col" className="m-0 border-none">
                      No
                    </th>
                    <th scope="col" className="m-0 border-none">
                      Minutes From
                    </th>
                    <th scope="col" className="m-0 border-none">
                      Minutes To
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((data, index) => (
                    <tr key={data.id} className="cursor-pointer border-none">
                      <td className="text-center border-none">{index + 1}</td>
                      <td className="pl-1 border-none">
                        <input
                          disabled={!!(dataRange.betAll || dataRange.allMinutes)}
                          type="text"
                          value={data.minutesFrom}
                          maxLength={3}
                          className="w-full outline-none border-none pt-[1px]"
                          onChange={(e) => handleInputChange(index, 'minutesFrom', e.target.value)}
                        />
                      </td>
                      <td className="pl-1 border-none">
                        <input
                          disabled={!!(dataRange.betAll || dataRange.allMinutes)}
                          type="text"
                          value={data.minutesTo}
                          maxLength={3}
                          className="w-full outline-none border-none pt-[1px]"
                          onChange={(e) => handleInputChange(index, 'minutesTo', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </BoxLabel>
      </div>
      <div className="py-5 flex gap-3 justify-center items-center">
        <div className="flex justify-center gap-1">
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={Boolean(dataRange.checkOdd)}
            id={`checkOdd_${typeAccount}`}
            onChange={(e) => updateRange('checkOdd', Number(e.target.checked))}
          />
          <label htmlFor={`checkOdd_${typeAccount}`} className="cursor-pointer ">
            Check Odds
          </label>
        </div>

        <div className="flex items-center">
          <p className="mr-1">Malay</p>
          <input
            disabled={!dataRange.checkOdd}
            onKeyDown={(e) => {
              if (['e', 'E', '+', ','].includes(e.key)) {
                e.preventDefault()
              }
            }}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            id="quantity1"
            name="quantity1"
            step="0.01"
            min={'-1'}
            max={'1'}
            value={dataRange.oddFrom}
            onChange={(e) => updateRange('oddFrom', e.target.value)}
            className="pl-[1px] w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-layout-color disabled:pointer-events-none h-[18px]"
          />
          <p className="mx-1">to</p>
          <input
            disabled={!dataRange.checkOdd}
            onKeyDown={(e) => {
              if (['e', 'E', '+', ','].includes(e.key)) {
                e.preventDefault()
              }
            }}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            id="quantity11"
            name="quantity11"
            step="0.01"
            min={'-1'}
            max={'1'}
            value={dataRange.oddTo}
            onChange={(e) => updateRange('oddTo', e.target.value)}
            className="pl-[1px] w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-layout-color disabled:pointer-events-none h-[18px]"
          />
        </div>
      </div>
      <div className="flex justify-end items-center py-3">
        <Button
          variant="outline"
          className="bg-white border border-solid border-gray-400 hover:border-blue-500 px-8 leading-none h-[20px] w-20 mr-4 rounded-[4px]"
          onClick={save}
        >
          OK
        </Button>
      </div>
    </div>
  )
}
export default React.memo(GameRange)
