import { Button } from '@renderer/components/ui/button'
import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import TableAccountBetAmount from '../components/TableAccountBetAmount'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import TableSportsBookBetAmount from '../components/TableSportsBookBetAmount'
import { updateBetAmount } from '@renderer/lib/updateBetAmount'
import { updateListCombination } from '@renderer/lib/updateBetAmountQuickAmountSetting'
import { getPlatforms } from '@renderer/lib/getPlatforms'
import { cleanDataQuickAmountSetting } from '@renderer/lib/cleanDataQuickAmountSetting'

const QuickAmountSettingModal = ({
  setShowQuickAmountSetting
}: {
  setShowQuickAmountSetting: Dispatch<SetStateAction<boolean>>
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair } = Combination

  const [listCombination, setListCombination] = useState(listAccountPair)
  const [listPlatform, setListPlatform] = useState(() =>
    getPlatforms(listAccountPair, 'QuickAmountSetting')
  )
  const handleCancel = () => {
    setShowQuickAmountSetting(false)
  }
  const handleSave = () => {
    setListAccountPair(cleanDataQuickAmountSetting(listCombination))
    setShowQuickAmountSetting(false)
  }

  const handleUpdate = () => {
    const listPlatformNew = updateBetAmount(listPlatform)
    setListPlatform(listPlatformNew)
    setListCombination(updateListCombination(listCombination, listPlatformNew))
  }
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#0C0E12] border border-[#22262F] rounded-lg max-w-7xl w-full max-h-[90vh] overflow-auto">
          <div className="px-6 py-4 border-b border-[#22262F]">
            <h2 className="text-xl font-semibold text-gray-200">
              Account combination bet amount settings
            </h2>
            Configure the bet amount settings for your account combinations. Adjust the betting
            parameters to manage the amount placed on each bet.
          </div>

          <div className="flex">
            {/* Line Settings */}
            <div className="w-2/3 border-r border-[#22262F]">
              <TableAccountBetAmount
                listCombination={listCombination}
                setListCombination={setListCombination}
              />
            </div>

            {/* Range Settings */}
            <div className="w-1/3">
              <div className="p-4 border-b border-[#22262F] font-semibold text-gray-200">
                Sportsbook settings
              </div>
              <TableSportsBookBetAmount
                setListPlatform={setListPlatform}
                listCombination={listPlatform}
              />
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
export default React.memo(QuickAmountSettingModal)
