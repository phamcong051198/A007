import React, { useContext } from 'react'
import { Dispatch, SetStateAction, useState } from 'react'
import { Modal } from '@renderer/components/AccountPair/QuickSetting/Modal'
import TableAccount from '@renderer/components/AccountPair/QuickSetting/QuickOddsRangeSetting/TableAccount'
import TableSportsBook from '@renderer/components/AccountPair/QuickSetting/QuickOddsRangeSetting/TableSportsBook'
import { Button } from '@renderer/components/ui/button'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { validateOddsTableAccount } from '@renderer/lib/validateOddsTableAccount'

const QuickOddsRangeSetting = ({
  setShowQuickOddsRangeSetting
}: {
  setShowQuickOddsRangeSetting: Dispatch<SetStateAction<boolean>>
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair } = Combination

  const [listCombination, setListCombination] = useState(listAccountPair)

  const save = () => {
    setListAccountPair(validateOddsTableAccount(listCombination))
    setShowQuickOddsRangeSetting(false)
  }
  return (
    <Modal
      title="Account Combination Odds Range Setting (Malay Odds)"
      onClose={() => setShowQuickOddsRangeSetting(false)}
    >
      <div className="h-[520px] pt-2 flex flex-col  ">
        <div className=" h-full flex ">
          <TableAccount listCombination={listCombination} setListCombination={setListCombination} />
          <TableSportsBook setListCombination={setListCombination} />
        </div>
        <div className="flex justify-end ">
          <Button
            variant="outline"
            className="bg-white border border-solid border-gray-400 hover:border-blue-500 mr-1  my-2 px-8 leading-none h-6 w-24"
            onClick={save}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
export default React.memo(QuickOddsRangeSetting)
