import { AccountPairContext } from '@renderer/context/AccountPairContext'
import BoxLabel from '@renderer/layouts/BoxLabel'
import React, { useContext, useMemo } from 'react'

const GeneralSetting = ({ typeAccount }) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair, currentAccountPair } = Combination

  const dataAccountPair = useMemo(
    () => (typeAccount === 'account1' ? currentAccountPair.account1 : currentAccountPair.account2),
    [typeAccount, currentAccountPair]
  )

  const updateField = (field: string, value: string | number) => {
    const updatedList = listAccountPair.map((item) => {
      if (item.id === currentAccountPair.id) {
        return {
          ...item,
          [typeAccount]: {
            ...item[typeAccount],
            [field]: value
          }
        }
      }
      return item
    })
    setListAccountPair(updatedList)
  }

  const updateGeneralSetting = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    updateField('generalSetting', value)
  }

  return (
    <BoxLabel label="General Setting" className="w-full">
      <div className="py-4">
        <div className="flex justify-center">
          <div className="flex flex-col gap-2">
            <div className="flex gap-14">
              <div className="flex items-center space-x-1.5">
                <input
                  type="radio"
                  id={`BetAll_${typeAccount}`}
                  name={`SelectOptionBet_${typeAccount}`}
                  value="BetAll"
                  className="bg-white cursor-pointer"
                  checked={dataAccountPair?.generalSetting === 'BetAll'}
                  onChange={updateGeneralSetting}
                />
                <label className="cursor-pointer" htmlFor={`BetAll_${typeAccount}`}>
                  Bet All
                </label>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="radio"
                  id={`NoBet_${typeAccount}`}
                  name={`SelectOptionBet_${typeAccount}`}
                  value="NoBet"
                  className="bg-white cursor-pointer"
                  checked={dataAccountPair?.generalSetting === 'NoBet'}
                  onChange={updateGeneralSetting}
                />
                <label className="cursor-pointer" htmlFor={`NoBet_${typeAccount}`}>
                  No Bet
                </label>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="radio"
                  id={`SelectBet_${typeAccount}`}
                  name={`SelectOptionBet_${typeAccount}`}
                  value="BetSelected"
                  className="bg-white cursor-pointer"
                  checked={dataAccountPair?.generalSetting === 'BetSelected'}
                  onChange={updateGeneralSetting}
                />
                <label className="cursor-pointer" htmlFor={`SelectBet_${typeAccount}`}>
                  Bet Selected
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BoxLabel>
  )
}

export default React.memo(GeneralSetting)
