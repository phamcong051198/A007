import { NavLink, Outlet } from 'react-router-dom'
import { SPORTS_BOOK_LIST } from '@shared/renderer/constants'
import AddSportsBook from '@renderer/components/SportsBook/AddSportsBook'
import QuickActions from '@renderer/components/SportsBook/QuickActions'
import { SwitchCustom } from '@renderer/components/ui/switch'
import { useEffect, useState } from 'react'
import { SettingType } from '@shared/common/types'

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
      <div className="mt-[24px] mx-[24px] h-full flex flex-col">
        <div className="mb-[24px]">
          <div className="flex justify-between ">
            <p className="text-2xl font-semibold">SportsBook</p>

            <div className="flex items-center">
              <div className="mr-5">
                <SwitchCustom checked={Boolean(enable)} onCheckedChange={handleActionEnable} />
              </div>
              <QuickActions />
              <AddSportsBook />
            </div>
          </div>
          <div className="min-w-[600px] border border-border-default rounded-[8px] bg-[#13161B] mt-[20px] px-[4px] flex gap-[3px] h-[44px] items-center">
            {SPORTS_BOOK_LIST.map(({ id, label }) => (
              <NavLink
                key={id}
                to={id}
                className={({ isActive }) => `
                  w-[114px] h-[36px] text-sm flex justify-center items-center rounded-[8px] cursor-pointer shadow-2xl leading-none font-semibold
                  ${isActive ? 'bg-layout-color text-white' : 'text-[#94979C] hover:bg-layout-color hover:text-white'}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex-1 h-full overflow-auto">
          <div className="">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
