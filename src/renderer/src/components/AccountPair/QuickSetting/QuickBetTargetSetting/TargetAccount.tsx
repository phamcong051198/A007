import React from 'react'

import TargetGeneralSetting from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting/TargetGeneralSetting'
import TargetDetailedSetting from '@renderer/components/AccountPair/QuickSetting/QuickBetTargetSetting/TargetDetailedSetting'

const TargetAccount = ({ typeAccount, target, setTarget, dataTarget, setDataTarget }) => {
  const labelText = typeAccount == 'account1' ? 'Bet Target A' : 'Bet Target B'

  return (
    <div className="flex-1 px-2">
      <div className="pt-3 py-14 pl-3 flex ml-2 gap-2 mt-1 cursor-pointer ">
        <input
          id={`target${typeAccount}`}
          type="checkbox"
          className="cursor-pointer"
          checked={target}
          onChange={(e) => setTarget(e.target.checked)}
        />
        <label htmlFor={`target${typeAccount}`} className="cursor-pointer">
          {labelText}
        </label>
      </div>
      <div className="flex flex-col gap-[12px] h-20">
        <TargetGeneralSetting
          typeAccount={typeAccount}
          dataTarget={dataTarget}
          setDataTarget={setDataTarget}
        />
        <TargetDetailedSetting
          typeAccount={typeAccount}
          dataTarget={dataTarget}
          setDataTarget={setDataTarget}
        />
      </div>
    </div>
  )
}

export default React.memo(TargetAccount)
