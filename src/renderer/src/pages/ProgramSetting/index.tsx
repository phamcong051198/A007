import { SettingProvider } from '@renderer/context/SettingContext'
import { PROGRAM_SETTING_LIST } from '@shared/renderer/constants'
import { NavLink, Outlet } from 'react-router-dom'

export default function ProgramSetting() {
  return (
    <SettingProvider>
      <div className="h-[calc(100vh-100px)] w-full bg-layout-color">
        <div className="mt-[32px] mx-[32px] h-full flex flex-col">
          <div className="mb-3">
            <div className="flex justify-between">
              <p className="text-white text-2xl font-semibold">Program Settings</p>
            </div>
            <div className="border border-border-default rounded-[8px] bg-[#13161B] mt-[20px] px-[4px] flex gap-[3px] h-[44px] items-center overflow-hidden">
              <div className="flex gap-[3px] scrollbar-hide">
                {PROGRAM_SETTING_LIST.map(({ id, label }) => (
                  <NavLink
                    key={id}
                    to={id}
                    className={({ isActive }) => `
                      px-[8px] h-[36px] text-sm flex justify-center items-center rounded-[8px] cursor-pointer shadow-2xl leading-none font-semibold flex-shrink-0
                      ${isActive ? 'bg-layout-color text-white' : 'text-[#94979C] hover:bg-layout-color hover:text-white'}`}
                    style={{ minWidth: '106px' }}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </SettingProvider>
  )
}
