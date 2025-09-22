import BoxLabel from '@renderer/layouts/BoxLabel'
import React from 'react'

const TargetGeneralSetting = ({ typeAccount, dataTarget, setDataTarget }) => {
  const data = dataTarget[`${typeAccount}`]

  const updateGeneralSetting = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setDataTarget((prev) => {
      return {
        ...prev,
        [typeAccount]: {
          ...prev[typeAccount],
          generalSetting: value
        }
      }
    })
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
                  id={`BetAllTarget_${typeAccount}`}
                  name={`SelectOptionBetTarget_${typeAccount}`}
                  value="BetAll"
                  className="bg-white cursor-pointer"
                  checked={data?.generalSetting === 'BetAll'}
                  onChange={updateGeneralSetting}
                />
                <label className="cursor-pointer" htmlFor={`BetAllTarget_${typeAccount}`}>
                  Bet All
                </label>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="radio"
                  id={`NoBetTarget_${typeAccount}`}
                  name={`SelectOptionBetTarget_${typeAccount}`}
                  value="NoBet"
                  className="bg-white cursor-pointer"
                  checked={data?.generalSetting === 'NoBet'}
                  onChange={updateGeneralSetting}
                />
                <label className="cursor-pointer" htmlFor={`NoBetTarget_${typeAccount}`}>
                  No Bet
                </label>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="radio"
                  id={`SelectBetTarget_${typeAccount}`}
                  name={`SelectOptionBetTarget_${typeAccount}`}
                  value="BetSelected"
                  className="bg-white cursor-pointer"
                  checked={data?.generalSetting === 'BetSelected'}
                  onChange={updateGeneralSetting}
                />
                <label className="cursor-pointer" htmlFor={`SelectBetTarget_${typeAccount}`}>
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
export default React.memo(TargetGeneralSetting)
