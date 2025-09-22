import { AccountPairContext } from '@renderer/context/AccountPairContext'
import React, { useContext, useMemo } from 'react'

const PlatformSetting = ({ typeAccount, amountRounderSetting }) => {
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

  const updateBetAmount = (value: string) => {
    const valueBetAmount = value.replace(/[^0-9]/g, '')
    if (valueBetAmount.length <= 10) {
      let betAmount = valueBetAmount
      if (Number(valueBetAmount) > 99999) {
        betAmount = '99999'
      }

      updateField('betAmount', betAmount)
    }
  }

  const updateCheckOdd = (value: boolean) => {
    updateField('checkOdd', Number(value))
  }

  const updateOddForm = (value: string) => {
    if (value.length <= 5) {
      updateField('oddFrom', value)
    }
  }

  const updateOddTo = (value: string) => {
    if (value.length <= 5) {
      updateField('oddTo', value)
    }
  }

  const updateBet = (value: boolean) => {
    updateField('bet', Number(value))
  }

  const updateContra = (value: boolean) => {
    updateField('contra', Number(value))
  }

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-xl font-bold py-2 text-blue-800">
          {dataAccountPair ? dataAccountPair.platform : '(SportsBook)'}
        </h1>
        <div className="mx-6">
          <div className="mb-2">
            <div className="flex gap-8">
              <p>Bet Amount: $</p>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                value={dataAccountPair?.betAmount ?? '100'}
                onChange={(e) => updateBetAmount(e.target.value)}
                className="pl-[1px] w-20 outline-none bg-white rounded-none border border-gray-500 focus:ring-0"
              />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-1">
              <input
                id={`CheckOdds_${typeAccount}`}
                type="checkbox"
                className="cursor-pointer"
                checked={Boolean(dataAccountPair?.checkOdd)}
                onChange={(e) => updateCheckOdd(e.target.checked)}
              />
              <label htmlFor={`CheckOdds_${typeAccount}`} className="cursor-pointer">
                Check Odds
              </label>
            </div>

            <div className="flex items-center">
              <p className="mr-4">Malay</p>
              <input
                disabled={!dataAccountPair?.checkOdd}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', ','].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                step="0.01"
                min="-1.000"
                max="1.000"
                className="pl-[1px] w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-layout-color disabled:pointer-events-none"
                value={dataAccountPair?.oddFrom ?? '0.01'}
                onChange={(e) => updateOddForm(e.target.value)}
              />
              <p className="mx-2">to</p>
              <input
                disabled={!dataAccountPair?.checkOdd}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', ','].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                step="0.01"
                min="-1.000"
                max="1.000"
                className="pl-[1px] w-16 outline-none bg-white rounded-none border border-gray-500 focus:ring-0 disabled:bg-layout-color disabled:pointer-events-none"
                value={dataAccountPair?.oddTo ?? '-0.01'}
                onChange={(e) => updateOddTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-9 mt-6">
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id={`bet_${typeAccount}`}
                  className="cursor-pointer"
                  checked={Boolean(dataAccountPair?.bet)}
                  onChange={(e) => updateBet(e.target.checked)}
                />
                <label htmlFor={`bet_${typeAccount}`} className="cursor-pointer">
                  Bet
                </label>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id={`contra_${typeAccount}`}
                  className="cursor-pointer"
                  checked={Boolean(dataAccountPair?.contra)}
                  onChange={(e) => updateContra(e.target.checked)}
                />
                <label htmlFor={`contra_${typeAccount}`} className="cursor-pointer">
                  Contra
                </label>
              </div>
            </div>
            <div
              className="text-[#0000FF] underline text-sm flex pr-28 cursor-pointer"
              onClick={() => amountRounderSetting(typeAccount)}
            >
              Amount Rounder Setting
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(PlatformSetting)
