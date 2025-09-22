import { Checkbox } from '@renderer/components/ui/checkbox'
import { InputNumber } from '@renderer/components/ui/input-number'
import { updateTableAccountQuickAmount } from '@renderer/lib/updateTableAccountQuickAmount'
import { useState } from 'react'

const TableAccountBetAmount = ({ listCombination, setListCombination }) => {
  const updateData = (dataUpdate) => {
    setListCombination((prev) => {
      return updateTableAccountQuickAmount(prev, dataUpdate)
    })
  }
  const [selectAll, setSelectAll] = useState(false)
  const updateSelectAll = (checked): void => {
    setSelectAll(checked)
    setListCombination((prev) =>
      prev.map((item) => {
        return { ...item, check: checked }
      })
    )
  }
  return (
    <div className="bg-[#0C0E12] border-[#22262F] overflow-hidden h-[500px]">
      {/* Table Container with Scroll */}
      <div className="px-4 py-4 border-b border-[#22262F]">
        <div className="flex items-center gap-3">
          <Checkbox
            id="checkAll"
            checked={selectAll}
            onCheckedChange={(checked) => {
              updateSelectAll(checked)
            }}
          />
          <label htmlFor="checkAll" className="cursor-pointer text-[#94979C] font-medium">
            Combination
          </label>
        </div>
      </div>
      <div className="overflow-auto h-full custom-scrollbar">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-[#0C0E12] sticky top-0 z-10">
            <tr className="border-b border-[#22262F]">
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[2px]"></th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[58px]">#</th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[50px]">
                Account 1
              </th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[92px]">
                Amount A
              </th>

              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[50px]">
                Account 2
              </th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[92px]">
                Amount B
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {listCombination.map((accountPair, index) => (
              <tr key={accountPair.id} className="border-b border-[#22262F]">
                <td className="px-2 py-3 text-gray-400 text-sm">
                  <Checkbox
                    id={accountPair.id}
                    checked={accountPair.check}
                    onCheckedChange={(checked) => {
                      updateData({
                        id: accountPair.id,
                        check: checked
                      })
                    }}
                  />
                </td>
                {/* Index */}
                <td className="px-2 py-3 text-gray-400 text-sm">{index + 1}</td>

                {/* Account 1 */}
                <td className="px-2 py-3 text-gray-300 text-sm">{accountPair.account1.platform}</td>

                {/* Account 1 - Amount */}
                <td className="px-2 py-3">
                  <InputNumber
                    value={Number(accountPair.account1.betAmount)}
                    onChange={(value) => {
                      updateData({
                        id: accountPair.id,
                        account1: {
                          betAmount: Number(value)
                        }
                      })
                    }}
                    precision={0}
                    step={100}
                    min={0}
                    className="w-12 h-8 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                {/* Account 2 */}
                <td className="px-2 py-3 text-gray-300 text-sm">{accountPair.account2.platform}</td>

                {/* Account 2 - Amount */}
                <td className="px-2 py-3">
                  <InputNumber
                    value={Number(accountPair.account2.betAmount)}
                    onChange={(value) => {
                      // Handle account2 from change
                      updateData({
                        id: accountPair.id,
                        account2: {
                          betAmount: Number(value)
                        }
                      })
                    }}
                    precision={0}
                    step={100}
                    min={0}
                    className="w-12 h-8 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              </tr>
            ))}

            {listCombination.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No combinations available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableAccountBetAmount
