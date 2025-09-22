import { useContext, useState } from 'react'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { getPlatforms } from '@renderer/lib/getPlatforms'
import { updateOdds } from '@renderer/lib/updateOdds'
import { updateOddsByPlatform } from '@renderer/lib/updateOddsByPlatform'

const TableSportsBook = ({ setListCombination }) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair } = Combination

  const [listPlatform, setListPlatform] = useState(() =>
    getPlatforms(listAccountPair, 'QuickOddsRangeSetting')
  )

  const updateData = (platform: string, type: string, value: number | string) => {
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
    const listPlatformNew = updateOdds(listPlatform)

    setListPlatform(listPlatformNew)
    setListCombination((prev) => {
      return updateOddsByPlatform(prev, listPlatformNew)
    })
  }
  return (
    <div className="flex-1 flex flex-col gap-[1px]">
      <div className="flex-1 flex flex-col">
        <p className="pl-2">Sportsbook Setting</p>
        <div className=" flex-1 border border-gray-800">
          <table className="text-xs text-left custom-table">
            <thead>
              <tr>
                <th className="w-40">SportsBook</th>
                <th>Check</th>
                <th>From</th>
                <th>To</th>
              </tr>
            </thead>
            <tbody>
              {listPlatform.map((platformInfo, index) => {
                return (
                  <tr key={index}>
                    <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <div className="flex items-center pl-2">{platformInfo.platform}</div>
                    </td>
                    <td className="py-[4px] flex justify-center items-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <input
                        type="checkbox"
                        checked={Boolean(platformInfo.checkOdd)}
                        onChange={(e) =>
                          updateData(platformInfo.platform, 'checkOdd', Number(e.target.checked))
                        }
                      />
                    </td>
                    <td className="px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="quantity1"
                        name="quantity1"
                        step="0.01"
                        min={'-1.000'}
                        max={'1.000'}
                        value={platformInfo.oddFrom}
                        onChange={(e) => {
                          let value = e.target.value
                          value = value.replace(/[^0-9.]/g, '')
                          if ((value.match(/\./g) || []).length > 1) {
                            return
                          }
                          if (value.length <= 10) {
                            updateData(platformInfo.platform, 'oddFrom', e.target.value)
                          }
                        }}
                        className="border-none pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                      />
                    </td>
                    <td className="px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="quantity1"
                        name="quantity1"
                        step="0.01"
                        min={'-1.000'}
                        max={'1.000'}
                        value={platformInfo.oddTo}
                        onChange={(e) => {
                          let value = e.target.value
                          value = value.replace(/[^0-9.]/g, '')
                          if ((value.match(/\./g) || []).length > 1) {
                            return
                          }
                          if (value.length <= 10) {
                            updateData(platformInfo.platform, 'oddTo', e.target.value)
                          }
                        }}
                        className="border-none pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
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
        className=" cursor-pointer border border-gray-400 flex justify-center rounded-md text-[#0000FF] hover:border-blue-500 font-bold text-sm mx-1 py-[2px]"
        onClick={handleUpdate}
      >
        Update
      </div>
    </div>
  )
}

export default TableSportsBook
