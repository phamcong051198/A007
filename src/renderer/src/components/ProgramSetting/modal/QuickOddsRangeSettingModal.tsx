import { Button } from '@renderer/components/ui/button'
import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import TableAccount from '../components/TableAccount'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import TableSportsBook from '../components/TableSportsBook'
import { getPlatforms } from '@renderer/lib/getPlatforms'
import { updateOdds } from '@renderer/lib/updateOdds'
import { updateOddsByPlatform } from '@renderer/lib/updateOddsByPlatform'

const QuickOddsRangeSettingModal = ({
  setShowQuickOddsRangeSetting
}: {
  setShowQuickOddsRangeSetting: Dispatch<SetStateAction<boolean>>
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair } = Combination

  const [listCombination, setListCombination] = useState(listAccountPair)
  const [listPlatform, setListPlatform] = useState(() =>
    getPlatforms(listAccountPair, 'QuickOddsRangeSetting')
  )
  const handleCancel = () => {
    setShowQuickOddsRangeSetting(false)
  }

  const handleSave = () => {
    setListAccountPair(listCombination)
    setShowQuickOddsRangeSetting(false)
  }

  const handleUpdate = () => {
    const listPlatformNew = updateOdds(listPlatform)
    setListCombination((prev) => {
      return updateOddsByPlatform(prev, listPlatformNew)
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#0C0E12] border border-[#22262F] rounded-lg max-w-[80%] w-full max-h-[90vh] overflow-auto">
          <div className="px-6 py-4 border-b border-[#22262F]">
            <h2 className="text-xl font-semibold text-gray-200">
              Account combination odds range setting (Malay odds)
            </h2>
            <div className="text-[#94979C] text-sm mt-2">
              Configure the odds range settings for your account combinations odds. Update the
              betting parameters and adjust the odds as needed.
            </div>
          </div>

          <div className="flex">
            {/* Line Settings */}
            <div className="w-2/3 border-r border-[#22262F]">
              <div className="p-4 border-b border-[#22262F] font-semibold text-gray-200">
                Combination list
              </div>
              <TableAccount
                listCombination={listCombination}
                setListCombination={setListCombination}
              />
            </div>

            {/* Range Settings */}
            <div className="w-1/3">
              <div className="p-4 border-b border-[#22262F] font-semibold text-gray-200">
                Sportsbook settings
              </div>
              <TableSportsBook listPlatform={listPlatform} setListPlatform={setListPlatform} />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-[#22262F]">
            <div className="flex justify-between py-4 px-6">
              <div className="flex">
                <Button onClick={handleUpdate}>Update</Button>
              </div>
              <div className="gap-4 flex">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="bg-transparent border-gray-400 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default React.memo(QuickOddsRangeSettingModal)
