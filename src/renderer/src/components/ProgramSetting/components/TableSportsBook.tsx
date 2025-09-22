import { Checkbox } from '@renderer/components/ui/checkbox'
import { InputNumber } from '@renderer/components/ui/input-number'

const TableSportsBook = ({ listPlatform, setListPlatform }) => {
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

  return (
    <div className="bg-[#0C0E12]  overflow-hidden h-[500px] ">
      {/* Table Container with Scroll */}
      <div className="overflow-auto h-full custom-scrollbar ">
        <table className="w-full min-w-[60px]">
          {/* Table Header */}
          <thead className="bg-[#0C0E12] sticky top-0 z-10">
            <tr className="border-b border-[#22262F] ">
              <th className="px-4 py-2 font-semibold text-sm text-[#94979C] text-left">
                SportsBook
              </th>
              <th className="px-2 py-2 font-semibold text-sm text-[#94979C] text-left">Check</th>
              <th className="px-2 py-2 font-semibold text-sm text-[#94979C]  text-left">From</th>
              <th className="px-2 py-2 font-semibold text-sm text-[#94979C]  text-left">To</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {listPlatform.map((platformInfo, index) => {
              return (
                <tr key={index} className="border-b border-[#22262F]">
                  <td className="px-2 py-3 font-medium  whitespace-nowrap dark:text-white">
                    <div className="flex items-center pl-2">{platformInfo.platform}</div>
                  </td>
                  <td className="px-2 py-3 font-medium  whitespace-nowrap dark:text-white">
                    <Checkbox
                      checked={Boolean(platformInfo.checkOdd)}
                      onCheckedChange={(checked) =>
                        updateData(platformInfo.platform, 'checkOdd', Number(checked))
                      }
                    />
                  </td>
                  <td className="px-2 py-3 font-medium  whitespace-nowrap dark:text-white">
                    <InputNumber
                      min={-1}
                      max={1}
                      step={0.01}
                      value={Number(platformInfo.oddFrom)}
                      onChange={(value) =>
                        updateData(platformInfo.platform, 'oddFrom', Number(value))
                      }
                    />
                  </td>
                  <td className="px-2 py-3 font-medium  whitespace-nowrap dark:text-white">
                    <InputNumber
                      min={-1}
                      max={1}
                      step={0.01}
                      value={Number(platformInfo.oddTo)}
                      onChange={(value) =>
                        updateData(platformInfo.platform, 'oddTo', Number(value))
                      }
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

export default TableSportsBook
