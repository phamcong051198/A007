import { Checkbox } from '@renderer/components/ui/checkbox'
import { InputNumber } from '@renderer/components/ui/input-number'
import { updateTableAccount } from '@renderer/lib/updateTableAccount'

const TableAccount = ({ listCombination, setListCombination }) => {
  const updateData = (dataUpdate) => {
    setListCombination((prev) => {
      return updateTableAccount(prev, dataUpdate)
    })
  }

  return (
    <div className="bg-[#0C0E12] overflow-hidden h-[500px]">
      {/* Table Container with Scroll */}
      <div className="overflow-auto h-full custom-scrollbar">
        <table className="w-full min-w-[1200px]">
          {/* Table Header */}
          <thead className="bg-[#0C0E12] sticky top-0 z-10">
            <tr className="border-b border-[#22262F]">
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[58px]">#</th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[120px]">
                Account 1
              </th>
              <th className="px-2 py-2 text-center text-gray-300 text-sm font-medium w-[92px]">
                Check
              </th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[106px]">
                Form
              </th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[106px]">
                To
              </th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[120px]">
                Account 2
              </th>
              <th className="px-2 py-2 text-center text-gray-300 text-sm font-medium w-[92px]">
                Check
              </th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[106px]">
                Form
              </th>
              <th className="px-2 py-2 text-left text-gray-300 text-sm font-medium w-[106px]">
                To
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {listCombination.map((accountPair, index) => (
              <tr key={accountPair.id} className="border-b border-[#22262F]">
                {/* Index */}
                <td className="px-2 py-3 text-gray-400 text-sm">{index + 1}</td>

                {/* Account 1 */}
                <td className="px-2 py-3 text-gray-300 text-sm">{accountPair.account1.platform}</td>

                {/* Account 1 - Check */}
                <td className="px-2 py-3 text-center">
                  <Checkbox
                    checked={Boolean(accountPair.account1.checkOdd)}
                    onCheckedChange={(checked) => {
                      updateData({
                        id: accountPair.id,
                        account1: {
                          checkOdd: Number(checked)
                        }
                      })
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                {/* Account 1 - From */}
                <td className="px-2 py-3">
                  <InputNumber
                    value={Number(accountPair.account1.oddFrom)}
                    onChange={(value) => {
                      updateData({
                        id: accountPair.id,
                        account1: {
                          oddFrom: Number(value)
                        }
                      })
                    }}
                    precision={2}
                    step={0.1}
                    min={-1}
                    max={1}
                    className="w-12 h-8 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                {/* Account 1 - To */}
                <td className="px-2 py-3">
                  <InputNumber
                    value={Number(accountPair.account1.oddTo)}
                    onChange={(value) => {
                      updateData({
                        id: accountPair.id,
                        account1: {
                          oddTo: Number(value)
                        }
                      })
                    }}
                    precision={2}
                    step={0.1}
                    min={-1}
                    max={1}
                    className="w-12 h-8 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                {/* Account 2 */}
                <td className="px-2 py-3 text-gray-300 text-sm">{accountPair.account2.platform}</td>

                {/* Account 2 - Check */}
                <td className="px-2 py-3 text-center">
                  <Checkbox
                    checked={Boolean(accountPair.account2.checkOdd)}
                    onCheckedChange={(checked) => {
                      updateData({
                        id: accountPair.id,
                        account2: {
                          checkOdd: Number(checked)
                        }
                      })
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                {/* Account 2 - From */}
                <td className="px-2 py-3">
                  <InputNumber
                    value={Number(accountPair.account2.oddFrom)}
                    onChange={(value) => {
                      updateData({
                        id: accountPair.id,
                        account2: {
                          oddFrom: Number(value)
                        }
                      })
                    }}
                    precision={2}
                    step={0.1}
                    min={-1}
                    max={1}
                    className="w-12 h-8 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                {/* Account 2 - To */}
                <td className="px-2 py-3">
                  <InputNumber
                    value={Number(accountPair.account2.oddTo) || 1.0}
                    onChange={(value) => {
                      updateData({
                        id: accountPair.id,
                        account2: {
                          oddTo: Number(value)
                        }
                      })
                    }}
                    precision={2}
                    step={0.1}
                    min={-1}
                    max={1}
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

export default TableAccount
