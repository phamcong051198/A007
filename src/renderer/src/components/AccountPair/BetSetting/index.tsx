import { memo, useContext, useState } from 'react'
import BoxLabel from '@renderer/layouts/BoxLabel'
import PlatformSetting from '@renderer/components/AccountPair/BetSetting/PlatformSetting'
import GeneralSetting from '@renderer/components/AccountPair/BetSetting/GeneralSetting'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import AmountRounderSetting from '@renderer/components/AccountPair/BetSetting/AmountRounderSetting'
import DetailedSetting from '@renderer/components/AccountPair/BetSetting/DetailedSetting'

const SettingCombinationComponent = () => {
  const context = useContext(AccountPairContext)
  const { currentAccountPair } = context.Combination

  const [showAmountRounderSetting, setShowAmountRounderSetting] = useState(false)
  const [account, setAccount] = useState<string>('')

  const amountRounderSetting = (typeAccount: string) => {
    setAccount(typeAccount)
    setShowAmountRounderSetting(true)
  }

  return (
    <div className="h-[406px] px-1 relative z-10">
      <BoxLabel label="Bet Setting" className="w-[900px]">
        <div className="flex ">
          <div className="flex-1">
            <PlatformSetting typeAccount="account1" amountRounderSetting={amountRounderSetting} />
          </div>
          <div className="text-xl font-bold py-2.5 text-center text-red-500 ">VS</div>
          <div className="flex-1">
            <PlatformSetting typeAccount="account2" amountRounderSetting={amountRounderSetting} />
          </div>
        </div>
        <div className="pt-4">
          <div className="flex gap-3 px-3">
            <div className="flex-1 flex flex-col gap-3.5">
              <div className="w-full">
                <h1 className="text-lg font-bold py-2.5 text-center text-blue-800">
                  {currentAccountPair?.account1
                    ? `${currentAccountPair.account1.platform || 'Unknown'}-${currentAccountPair.account1.loginID || 'Unknown'}`
                    : '(SelectSportBook)'}
                </h1>

                <div>
                  <GeneralSetting typeAccount="account1" />
                </div>
              </div>

              <DetailedSetting typeAccount="account1" />
            </div>
            <div className="flex-1 flex flex-col gap-3.5">
              <div className="w-full">
                <h1 className="text-lg font-bold py-2.5 text-center text-blue-800">
                  {currentAccountPair?.account2
                    ? `${currentAccountPair.account2.platform || 'Unknown'}-${currentAccountPair.account2.loginID || 'Unknown'}`
                    : '(SelectSportBook)'}
                </h1>

                <div>
                  <GeneralSetting typeAccount="account2" />
                </div>
              </div>
              <DetailedSetting typeAccount="account2" />
            </div>
          </div>
        </div>
      </BoxLabel>
      {Object.keys(currentAccountPair).length === 0 && (
        <div
          className="absolute top-[-11px] left-[2px] right-0 bottom-0  bg-layout-color opacity-60 z-50 pointer-events-auto"
          style={{ width: '904px', height: '417px' }}
        />
      )}
      {showAmountRounderSetting && (
        <AmountRounderSetting
          account={account}
          setShowAmountRounderSetting={setShowAmountRounderSetting}
        />
      )}
    </div>
  )
}

export const SettingCombination = memo(SettingCombinationComponent)
