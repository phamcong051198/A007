import { updateTableAccountQuickAmount } from '@renderer/lib/updateTableAccountQuickAmount'
import React, { useState } from 'react'

const TableAccount = ({ listCombination, setListCombination }) => {
  const [selectAll, setSelectAll] = useState(true)

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
    <div className="flex flex-col w-2/3">
      <p className="pl-2">Combination List</p>
      <div className=" border border-gray-800 h-[541px] overflow-auto custom-scrollbar  ">
        <table className="text-xs text-left bg-white custom-table">
          <thead>
            <tr>
              <th>Check</th>
              <th>No</th>
              <th className="w-52">Account A</th>
              <th className="w-20">Amount A</th>
              <th className="w-52">Account B</th>
              <th className="w-20">Amount B</th>
            </tr>
          </thead>
          <tbody>
            {listCombination.map((accountPair, index) => {
              const infoAccount1 = `${accountPair.account1.platform}-${accountPair.account1.loginID}`
              const infoAccount2 = `${accountPair.account2.platform}-${accountPair.account2.loginID}`
              return (
                <tr key={accountPair.id}>
                  <td className="flex justify-center items-center  py-[4px] font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={accountPair.check}
                      onChange={(e) =>
                        updateData({
                          id: accountPair.id,
                          check: e.target.checked
                        })
                      }
                    />
                  </td>
                  <td className="pl-2">
                    <span>{index + 1}</span>
                  </td>
                  <td className="pl-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {infoAccount1}
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
                      value={accountPair.account1.betAmount}
                      onChange={(e) => {
                        let value = e.target.value
                        value = value.replace(/[^0-9]/g, '')
                        if ((value.match(/\./g) || []).length > 1) {
                          return
                        }
                        if (value.length <= 10) {
                          updateData({
                            id: accountPair.id,
                            account1: {
                              betAmount: value
                            }
                          })
                        }
                      }}
                      className="text-sm font-extrabold text-blue-color border-none pl-1 w-full outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                    />
                  </td>

                  <td className="pl-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {infoAccount2}
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
                      value={accountPair.account2.betAmount}
                      onChange={(e) => {
                        let value = e.target.value
                        value = value.replace(/[^0-9]/g, '')
                        if ((value.match(/\./g) || []).length > 1) {
                          return
                        }
                        if (value.length <= 10) {
                          updateData({
                            id: accountPair.id,
                            account2: {
                              betAmount: value
                            }
                          })
                        }
                      }}
                      className="text-sm font-extrabold text-blue-color border-none pl-1 w-full outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="absolute bottom-[-24px] left-2 flex ml-2 gap-2 mt-1">
        <input
          type="checkbox"
          id="checkAll"
          className="cursor-pointer"
          checked={selectAll}
          onChange={updateSelectAll}
        />
        <label htmlFor="checkAll" className="cursor-pointer">
          Select all
        </label>
      </div>
    </div>
  )
}

export default React.memo(TableAccount)
