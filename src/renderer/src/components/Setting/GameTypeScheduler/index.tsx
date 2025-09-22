import React, { useContext } from 'react'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { SettingContext } from '@renderer/context/SettingContext'
import { SchedulerItem } from '@renderer/components/Setting/GameTypeScheduler/SchedulerItem'

const GameTypeScheduler = () => {
  const context = useContext(SettingContext)
  if (!context) return null

  const { running, today, early } = context.gameTypeScheduler
  return (
    <BoxLabel label="Game Type Scheduler" className="w-[301px]">
      <div className="py-2 px-5 flex flex-col gap-[1.5px]">
        <SchedulerItem label="Running" state={running} id="Running_Checkbox_Scheduler" />
        <SchedulerItem label="Today" state={today} id="Today_Checkbox_Scheduler" />
        <SchedulerItem label="Early" state={early} id="Early_Checkbox_Scheduler" />
      </div>
    </BoxLabel>
  )
}

export default React.memo(GameTypeScheduler)
