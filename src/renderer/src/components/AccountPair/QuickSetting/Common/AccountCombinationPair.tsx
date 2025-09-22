import { updateTableAccountQuickAmount } from '@renderer/lib/updateTableAccountQuickAmount'
import React, { useState } from 'react'

const AccountCombinationPair = ({ listCombination, setListCombination }) => {
  const [selectAll, setSelectAll] = useState(false)

  const updateData = (dataUpdate) => {
    setListCombination((prev) => {
      return updateTableAccountQuickAmount(prev, dataUpdate)
    })
  }

  const updateSelectAll = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = e.target.checked
    setSelectAll(checked)
    setListCombination((prev) =>
      prev.map((item) => {
        return { ...item, check: checked }
      })
    )
  }

  return (
    <div className="flex flex-col w-[380px]">
      <p className="pl-2">Account Combination Pair</p>
      <div className="h-[383px] border border-gray-400 bg-white  overflow-auto custom-scrollbar">
        {listCombination.map((accountPair) => {
          return (
            <div key={accountPair.id} className="flex ml-[2px] items-center">
              <input
                id={accountPair.id}
                type="checkbox"
                checked={accountPair.check}
                onChange={(e) =>
                  updateData({
                    id: accountPair.id,
                    check: e.target.checked
                  })
                }
              />
              <label
                htmlFor={accountPair.id}
                className="pl-[4px] flex-1 hover:bg-blue-500 hover:text-white cursor-pointer"
              >
                {accountPair.account1.platform + '-' + accountPair.account1.loginID}
                {' - '}
                {accountPair.account2.platform + '-' + accountPair.account2.loginID}
              </label>
            </div>
          )
        })}
      </div>
      <div className="flex ml-2 gap-2 mt-1">
        <input id="checkAll" type="checkbox" checked={selectAll} onChange={updateSelectAll} />
        <label htmlFor="checkAll" className="cursor-pointer">
          Select all
        </label>
      </div>
    </div>
  )
}

export default React.memo(AccountCombinationPair)
