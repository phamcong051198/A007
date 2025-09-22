import { Button } from '@renderer/components/ui/button'
import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import AccountCombinationPair from '../components/AccountCombinationPair'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { generateTargetAccountData } from '@renderer/lib/generateAccountData'
import { cleanDataQuickBetTargetSetting } from '@renderer/lib/cleanDataQuickBetTargetSetting'
import TargetAccount from '../components/TargetAccount'

const QuickBetTargetSettingModal = ({
  setShowQuickBetTargetSetting
}: {
  setShowQuickBetTargetSetting: Dispatch<SetStateAction<boolean>>
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair } = Combination

  const [listCombination, setListCombination] = useState(() => {
    return listAccountPair.map((item) => ({
      ...item,
      check: false
    }))
  })

  const [targetA, setTargetA] = useState(false)
  const [targetB, setTargetB] = useState(false)
  const [dataTarget, setDataTarget] = useState({
    account1: { ...generateTargetAccountData() },
    account2: { ...generateTargetAccountData() }
  })
  const handleCancel = () => {
    setShowQuickBetTargetSetting(false)
  }
  const save = () => {
    setListAccountPair(
      cleanDataQuickBetTargetSetting(listCombination, dataTarget, targetA, targetB)
    )
    setShowQuickBetTargetSetting(false)
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
              <div className="p-4  font-semibold text-gray-200">Setting</div>
              <div className="flex">
                <TargetAccount
                  typeAccount="account1"
                  target={targetA}
                  setTarget={setTargetA}
                  dataTarget={dataTarget}
                  setDataTarget={setDataTarget}
                />
                <TargetAccount
                  typeAccount="account2"
                  target={targetB}
                  setTarget={setTargetB}
                  dataTarget={dataTarget}
                  setDataTarget={setDataTarget}
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
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default React.memo(QuickBetTargetSettingModal)
