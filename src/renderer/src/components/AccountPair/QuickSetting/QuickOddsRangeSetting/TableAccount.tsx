import { updateTableAccount } from '@renderer/lib/updateTableAccount'

const TableAccount = ({ listCombination, setListCombination }) => {
  const updateData = (dataUpdate) => {
    setListCombination((prev) => {
      return updateTableAccount(prev, dataUpdate)
    })
  }

  return (
    <div className="flex flex-col w-2/3">
      <p className="pl-2">Combination List</p>
      <div className=" border border-gray-800 h-[461px] overflow-auto custom-scrollbar  ">
        <table className="text-xs text-left bg-white mt-0 custom-table">
          <thead>
            <tr>
              <th>No</th>
              <th className="w-40">Account A</th>
              <th>Check</th>
              <th>From</th>
              <th>To</th>
              <th className="w-40">Account B</th>
              <th>Check</th>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {listCombination.map((accountPair, index) => {
              const infoAccount1 = `${accountPair.account1.platform}-${accountPair.account1.loginID}`
              const infoAccount2 = `${accountPair.account2.platform}-${accountPair.account2.loginID}`
              return (
                <tr key={accountPair.id}>
                  <td className="pl-2">
                    <span>{index + 1}</span>
                  </td>
                  <td className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <div className="px-2 flex items-center">{infoAccount1}</div>
                  </td>
                  <td className="py-[4px] flex justify-center items-center px-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <input
                      type="checkbox"
                      checked={Boolean(accountPair.account1.checkOdd)}
                      onChange={(e) => {
                        updateData({
                          id: accountPair.id,
                          account1: {
                            checkOdd: Number(e.target.checked)
                          }
                        })
                      }}
                    />
                  </td>
                  <td className="px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <input
                      type="number"
                      inputMode="numeric"
                      id="quantity1"
                      name="quantity1"
                      step="0.01"
                      min={'-1.000'}
                      max={'1.000'}
                      value={accountPair.account1.oddFrom}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 5) {
                          updateData({
                            id: accountPair.id,
                            account1: {
                              oddFrom: value
                            }
                          })
                        }
                      }}
                      className="border-none pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                    />
                  </td>
                  <td className="px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <input
                      type="number"
                      inputMode="numeric"
                      id="quantity2"
                      name="quantity2"
                      step="0.01"
                      min={'-1.000'}
                      max={'1.000'}
                      value={accountPair.account1.oddTo}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 5) {
                          updateData({
                            id: accountPair.id,
                            account1: {
                              oddTo: value
                            }
                          })
                        }
                      }}
                      className="border-none pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                    />
                  </td>
                  <td className="px-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {infoAccount2}
                  </td>
                  <td className="py-[4px] flex justify-center items-center px-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <input
                      type="checkbox"
                      checked={Boolean(accountPair.account2.checkOdd)}
                      onChange={(e) => {
                        updateData({
                          id: accountPair.id,
                          account2: {
                            checkOdd: Number(e.target.checked)
                          }
                        })
                      }}
                    />
                  </td>
                  <td className="px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <input
                      type="number"
                      inputMode="numeric"
                      id="quantity3"
                      name="quantity3"
                      step="0.01"
                      min={'-1.000'}
                      max={'1.000'}
                      value={accountPair.account2.oddFrom}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 5) {
                          updateData({
                            id: accountPair.id,
                            account2: {
                              oddFrom: value
                            }
                          })
                        }
                      }}
                      className="border-none pl-1 w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-[#E0E0E0] disabled:pointer-events-none"
                    />
                  </td>
                  <td className="px-1 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <input
                      type="number"
                      inputMode="numeric"
                      id="quantity4"
                      name="quantity4"
                      step="0.01"
                      min={'-1.000'}
                      max={'1.000'}
                      value={accountPair.account2.oddTo}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 5) {
                          updateData({
                            id: accountPair.id,
                            account2: {
                              oddTo: value
                            }
                          })
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
  )
}

export default TableAccount
