import { Dispatch, SetStateAction, useContext, useState } from 'react'

import { Modal } from '@renderer/components/AccountPair/QuickSetting/Modal'
import AccountCombinationPair from '@renderer/components/AccountPair/QuickSetting/Common/AccountCombinationPair'
import { Button } from '@renderer/components/ui/button'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import BoxLabel from '@renderer/layouts/BoxLabel'
import TargetAccount from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting/TargetAccount'
import { generateTargetAccountData } from '@renderer/lib/generateAccountData'
import { cleanDataQuickBetTargetSetting } from '@renderer/lib/cleanDataQuickBetTargetSetting'

export const QuickBetTargetSetting = ({
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
  const save = () => {
    setListAccountPair(
      cleanDataQuickBetTargetSetting(listCombination, dataTarget, targetA, targetB)
    )
    setShowQuickBetTargetSetting(false)
  }

  return (
    <Modal
      title="Account Combination Bet Target Setting"
      onClose={() => setShowQuickBetTargetSetting(false)}
    >
      <div className="h-[468px] pt-2 flex flex-col bg-layout-color rounded-b-xl ">
        <div className="flex">
          <AccountCombinationPair
            listCombination={listCombination}
            setListCombination={setListCombination}
          />
          <div className="relative flex-1 flex flex-col gap-[1px] pt-4">
            <BoxLabel label="Settings" className="w-[830px]">
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
            </BoxLabel>
            {!targetA && (
              <div
                className="absolute right-[419px] top-[88px] bg-layout-color opacity-50 z-50 pointer-events-auto"
                style={{ width: '407px', height: '81px' }}
              />
            )}

            {!targetB && (
              <div
                className="absolute right-[2px] top-[88px] bg-layout-color  opacity-50 z-50 pointer-events-auto"
                style={{ width: '407px', height: '81px' }}
              />
            )}
          </div>
        </div>
        <div className="flex justify-end ">
          <Button
            variant="outline"
            className="bg-white border border-solid border-gray-400 hover:border-blue-500 mr-3  my-3 px-8 leading-none h-6 w-28"
            onClick={save}
          >
            OK
          </Button>
        </div>
      </div>
    </Modal>
  )
}
