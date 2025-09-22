import { Button } from '@renderer/components/ui/button'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import AccountCombinationPair from '../components/AccountCombinationPair'
import AccountRounder from '../components/AccountRounder'
import { cleanDataQuickAmountRounderSetting } from '@renderer/lib/cleanDataQuickAmountRounderSetting'

const QuickAmountRounderSettingModal = ({
  setShowQuickAmountRounderSetting
}: {
  setShowQuickAmountRounderSetting: Dispatch<SetStateAction<boolean>>
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair } = Combination

  const [amountRounders, setAmountRounders] = useState({
    account1: { amountRounderSetting: { rounder: 0, roundType: 'roundDown', roundValue: '2' } },
    account2: { amountRounderSetting: { rounder: 0, roundType: 'roundDown', roundValue: '2' } }
  })

  const [listCombination, setListCombination] = useState(() => {
    return listAccountPair.map((item) => ({
      ...item,
      check: false
    }))
  })

  const handleCancel = () => {
    setShowQuickAmountRounderSetting(false)
  }

  const handleSave = () => {
    console.log(
      'cleanDataQuickAmountRounderSetting(listCombination, amountRounders)',
      cleanDataQuickAmountRounderSetting(listCombination, amountRounders)
    )
    setListAccountPair(cleanDataQuickAmountRounderSetting(listCombination, amountRounders))
    setShowQuickAmountRounderSetting(false)
  }
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#0C0E12] border border-[#22262F] rounded-lg max-w-7xl w-full max-h-[90vh] overflow-auto">
          <div className="px-6 py-4 border-b border-[#22262F]">
            <h2 className="text-xl font-semibold text-gray-200">
              Account combination odds range setting (Malay odds)
            </h2>
            Configure the odds range settings for your account combinations odds. Update the betting
            parameters and adjust the odds as needed.
          </div>

          <div className="flex">
            {/* Line Settings */}
            <div className="w-1/2 border-r border-[#22262F]">
              <div className="p-4 border-b border-[#22262F] font-semibold text-gray-200">
                Combination list
              </div>
              <AccountCombinationPair
                listCombination={listCombination}
                setListCombination={setListCombination}
              />
            </div>

            {/* Range Settings */}
            <div className="w-1/2">
              <div className="p-4 border-b border-[#22262F] font-semibold text-gray-200">
                Sportsbook settings
              </div>
              <div className="flex">
                <AccountRounder
                  typeAccount="account1"
                  amountRounders={amountRounders}
                  setAmountRounders={setAmountRounders}
                />
                <AccountRounder
                  typeAccount="account2"
                  amountRounders={amountRounders}
                  setAmountRounders={setAmountRounders}
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-[#22262F]">
            <div className="flex justify-end py-4 px-6">
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
export default React.memo(QuickAmountRounderSettingModal)
