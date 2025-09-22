import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { getPlatforms } from '@renderer/lib/getPlatforms'
import { updateBetAmount } from '@renderer/lib/updateBetAmount'
import { updateListCombination } from '@renderer/lib/updateBetAmountQuickAmountSetting'

import React, { useContext, useState } from 'react'

const TableSportsBook = ({ listCombination, setListCombination }) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair } = Combination

  const [listPlatform, setListPlatform] = useState(() =>
    getPlatforms(listAccountPair, 'QuickAmountSetting')
  )
  const updateData = (platform: string, type: string, value: string) => {
    setListPlatform((prev) =>
      prev.map((item) => {
        if (item.platform === platform) {
          return {
            ...item,
            [type]: value
          }
        }
        return item
      })
    )
  }

  const handleUpdate = () => {
    const listPlatformNew = updateBetAmount(listPlatform)
    setListPlatform(listPlatformNew)
    setListCombination(updateListCombination(listCombination, listPlatformNew))
  }
  return (
    <div className="flex-1 flex flex-col gap-[1px]">
      <div className="flex-1 flex flex-col">
        <p className="pl-2">Sportsbook Setting</p>
        <div className=" flex-1 border border-gray-800">
          <table className="text-xs text-left custom-table">
            <thead>
              <tr>
                <th className="w-52">SportsBook</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {listPlatform.map((platformInfo, index) => {
                return (
                  <tr key={index}>
                    <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <div className="flex items-center pl-2 py-[2px]">{platformInfo.platform}</div>
                    </td>
                    <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="quantity1"
                        name="quantity1"
                        step="100"
                        min={'0'}
                        value={platformInfo.betAmount}
                        onChange={(e) => {
                          let value = e.target.value
                          value = value.replace(/[^0-9]/g, '')
                          if ((value.match(/\./g) || []).length > 1) {
                            return
                          }
                          if (value.length <= 10) {
                            updateData(platformInfo.platform, 'betAmount', value)
                          }
                        }}
                        className="text-sm font-extrabold text-blue-color border-none pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div
        className="font-extrabold cursor-pointer border border-gray-400 flex justify-center rounded-md text-[#0000FF] hover:border-blue-500  text-sm mx-1  py-[2px]"
        onClick={handleUpdate}
      >
        Update
      </div>
    </div>
  )
}

export default React.memo(TableSportsBook)
