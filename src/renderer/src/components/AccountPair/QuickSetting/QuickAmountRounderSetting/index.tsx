import { Dispatch, SetStateAction, useContext, useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Modal } from '@renderer/components/AccountPair/QuickSetting/Modal'
import AccountCombinationPair from '@renderer/components/AccountPair/QuickSetting/Common/AccountCombinationPair'
import AmountRounders from '@renderer/components/AccountPair/QuickSetting/QuickAmountRounderSetting/AmountRounders'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { cleanDataQuickAmountRounderSetting } from '@renderer/lib/cleanDataQuickAmountRounderSetting'

export const QuickAmountRounderSetting = ({
  setShowQuickBetAmountSetting
}: {
  setShowQuickBetAmountSetting: Dispatch<SetStateAction<boolean>>
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

  const handleSave = () => {
    setListAccountPair(cleanDataQuickAmountRounderSetting(listCombination, amountRounders))
    setShowQuickBetAmountSetting(false)
  }
  return (
    <Modal
      title="Account Combination Amount Rounder Setting"
      onClose={() => setShowQuickBetAmountSetting(false)}
    >
      <div className="h-[456px] pt-2 flex flex-col bg-layout-color rounded-b-xl ">
        <div className="flex ">
          <AccountCombinationPair
            listCombination={listCombination}
            setListCombination={setListCombination}
          />
          <AmountRounders amountRounders={amountRounders} setAmountRounders={setAmountRounders} />
        </div>
        <div className="flex-1 flex justify-end items-start">
          <Button
            variant="outline"
            className="bg-white border border-solid border-gray-400 hover:border-blue-500 mr-3  px-8 leading-none h-6 w-28"
            onClick={handleSave}
          >
            OK
          </Button>
        </div>
      </div>
    </Modal>
  )
}
