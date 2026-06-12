import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import AddSportsBook from '@renderer/components/SportsBook/AddSportsBook'
import QuickActions from '@renderer/components/SportsBook/QuickActions'
import { SwitchCustom } from '@renderer/components/ui/switch'

import { SettingType } from '@shared/common/types'
import { SPORTS_BOOK_LIST } from '@shared/renderer/constants'

export default function SportsBook() {
  const [enable, setEnable] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const data = (await window.electron.ipcRenderer.invoke('GetDataSetting')) as SettingType[]
      setEnable(data[0].enable)
    }

    fetchData()

    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetDataSetting')
    }
  }, [])

  const handleActionEnable = () => {
    setEnable((prev) => {
      const newValue = prev ? 0 : 1
      window.electron.ipcRenderer.send('UpdateEnable', newValue)
      return newValue
    })
  }

  return (
    <div className="w-full bg-layout-color h-[calc(100vh-95px)]">
      <div className="mt-[24px] mx-[10px] h-full flex flex-col">
        <div className="mb-[20px]">
          <div className="flex justify-between ">
            <p className="text-2xl font-semibold">SportsBook</p>

            <div className="flex items-center">
              <div className="mr-5 flex items-center gap-1">
                <SwitchCustom checked={Boolean(enable)} onCheckedChange={handleActionEnable} />
                <span>Đỏ là cào data không bet</span>
              </div>
              <QuickActions />
              <AddSportsBook />
            </div>
          </div>

          {/* Tabs */}
          <div className="min-w-[600px] border border-border-default rounded-[8px] bg-hover-default mt-[10px] px-[2px] flex gap-[3px] h-[36px] items-center">
            {SPORTS_BOOK_LIST.map(({ id, label }) => (
              <NavLink
                key={id}
                to={id}
                className={({ isActive }) => `
                  w-[110px] h-[30px] text-sm flex justify-center items-center rounded-[8px] cursor-pointer shadow-2xl leading-none font-semibold
                  ${isActive ? 'bg-white' : ' hover:bg-white'}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex-1 h-full overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
