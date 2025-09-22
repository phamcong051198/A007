import { Checkbox } from '@renderer/components/ui/checkbox'
import { updateTableAccountQuickAmount } from '@renderer/lib/updateTableAccountQuickAmount'
import { getThemeClass } from '@shared/common/constants'
import React, { useState } from 'react'

const AccountCombinationPair = ({ listCombination, setListCombination }) => {
  const [selectAll, setSelectAll] = useState(false)

  const updateData = (dataUpdate) => {
    setListCombination((prev) => {
      return updateTableAccountQuickAmount(prev, dataUpdate)
    })
  }

  const updateSelectAll = (checked): void => {
    setSelectAll(checked)
    setListCombination((prev) =>
      prev.map((item) => {
        return { ...item, check: checked }
      })
    )
  }

  return (
    <div className="bg-[#0C0E12]  border-[#22262F] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#22262F]">
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

      {/* List */}
      <div className="h-[383px] overflow-auto custom-scrollbar">
        {listCombination.map((accountPair, index) => {
          return (
            <div
              key={accountPair.id}
              className={`flex items-center px-4 py-3 hover:bg-[#1A1D23] transition-colors ${
                index !== listCombination.length - 1 ? 'border-b border-[#22262F]' : ''
              }`}
            >
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

              <label
                htmlFor={accountPair.id}
                className="ml-3 flex-1 cursor-pointer text-[#94979C] hover:text-white transition-colors"
              >
                <span className={getThemeClass('text')}>[{accountPair.account1.platform}]</span>
                <span className="text-[#94979C]">-{accountPair.account1.loginID}</span>
                <span className="mx-2 text-gray-500">vs.</span>
                <span className={getThemeClass('text')}>[{accountPair.account2.platform}]</span>
                <span className="text-[#94979C]">-{accountPair.account2.loginID}</span>
              </label>
            </div>
          )
        })}

        {listCombination.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">No combinations available</div>
        )}
      </div>
    </div>
  )
}

export default React.memo(AccountCombinationPair)
