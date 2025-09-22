import React, { useContext } from 'react'
import { Dispatch, SetStateAction, useState } from 'react'
import { Modal } from '@renderer/components/AccountPair/QuickSetting/Modal'
import { Button } from '@renderer/components/ui/button'
import TableAccount from '@renderer/components/AccountPair/QuickSetting/QuickAmountSetting/TableAccount'
import TableSportsBook from '@renderer/components/AccountPair/QuickSetting/QuickAmountSetting/TableSportsBook'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { cleanDataQuickAmountSetting } from '@renderer/lib/cleanDataQuickAmountSetting'

const QuickAmountSetting = ({
  setShowQuickBetAmountSetting
}: {
  setShowQuickBetAmountSetting: Dispatch<SetStateAction<boolean>>
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair } = Combination

  const [listCombination, setListCombination] = useState(() => {
    return listAccountPair.map((item) => ({
      ...item,
      check: true
    }))
  })

  const handleSave = () => {
    setListAccountPair(cleanDataQuickAmountSetting(listCombination))
    setShowQuickBetAmountSetting(false)
  }
  return (
    <Modal
      title="Account Combination Bet Amount Setting"
      onClose={() => setShowQuickBetAmountSetting(false)}
    >
      <div className="h-[600px] pt-2 flex flex-col">
        <div className=" relative h-full flex ">
          <TableAccount listCombination={listCombination} setListCombination={setListCombination} />
          <TableSportsBook
            listCombination={listCombination}
            setListCombination={setListCombination}
          />
        </div>
        <div className="flex justify-end ">
          <Button
            variant="outline"
            className="bg-white border border-solid border-gray-400 hover:border-blue-500 mr-2  my-2 px-8 leading-none h-6 w-24"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default React.memo(QuickAmountSetting)
