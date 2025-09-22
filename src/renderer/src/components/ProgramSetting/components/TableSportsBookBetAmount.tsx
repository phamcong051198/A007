import { useContext, useState } from 'react'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { getPlatforms } from '@renderer/lib/getPlatforms'
import { updateOdds } from '@renderer/lib/updateOdds'
import { updateOddsByPlatform } from '@renderer/lib/updateOddsByPlatform'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { InputNumber } from '@renderer/components/ui/input-number'
import { updateBetAmount } from '@renderer/lib/updateBetAmount'
import { updateListCombination } from '@renderer/lib/updateBetAmountQuickAmountSetting'

const TableSportsBookBetAmount = ({ listCombination, setListPlatform }) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair } = Combination

  // const [listPlatform, setListPlatform] = useState(() =>
  //   getPlatforms(listAccountPair, 'QuickAmountSetting')
  // )

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

  // const handleUpdate = () => {
  //   const listPlatformNew = updateOdds(listPlatform)

  //   setListPlatform(listPlatformNew)
  //   setListCombination((prev) => {
  //     return updateOddsByPlatform(prev, listPlatformNew)
  //   })
  // }
  return (
    <div className="bg-[#0C0E12] border border-[#22262F] overflow-hidden h-[500px] ">
      {/* Table Container with Scroll */}
      <div className="overflow-auto h-full custom-scrollbar ">
        <table className="w-full min-w-[60px]">
          {/* Table Header */}
          <thead className="bg-[#0C0E12] sticky top-0 z-10">
            <tr className="border-b border-[#22262F] ">
              <th className="px-4 py-2 w-4 font-semibold text-sm text-[#94979C] text-left">
                SportsBook
              </th>
              <th className="px-2 py-2 font-semibold text-sm text-[#94979C] w-12 text-left">
                Amount 1
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {listCombination.map((platformInfo, index) => {
              return (
                <tr key={index} className="border-b border-[#22262F]">
                  <td className="px-2 py-3 font-medium  whitespace-nowrap dark:text-white">
                    <div className="flex items-center pl-2">{platformInfo.platform}</div>
                  </td>

                  <td className="px-2 py-3 font-medium  whitespace-nowrap dark:text-white">
                    <InputNumber
                      min={0}
                      precision={0}
                      step={100}
                      value={Number(platformInfo.betAmount)}
                      onChange={(value) => updateData(platformInfo.platform, 'betAmount', value)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableSportsBookBetAmount
