import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import ChevronDown from '@renderer/icons/chevron-down'
import DelayLogin from '@renderer/icons/delay-log-in'
import LogIn from '@renderer/icons/log-in'
import LogOut from '@renderer/icons/log-out'
import Settings from '@renderer/icons/settings'
import ScheduledLoginLogoutSetting from '@renderer/windows/ScheduledLoginLogoutSetting'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

export default function QuickActions() {
  const [isScheduledLoginLogoutSettingOpen, setScheduledLoginLogoutSettingOpen] = useState(false)
  const handleLoginAll = () => {
    window.electron.ipcRenderer.send('LoginAll')
  }

  const handleLogoutAll = () => {
    window.electron.ipcRenderer.send('LogoutAll')
  }

  const handleDelayLoginAll = () => {
    window.electron.ipcRenderer.send('DelayLoginAll')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`${isBSoft ? 'hover:border-blue-color' : 'hover:border-purple-color'} w-[165px] h-[40px] text-sm rounded-[8px] border border-border-default mr-[12px] text-white hover:opacity-90  `}
        >
          <div className="flex items-center justify-center gap-[4px]">
            <p>Quick Actions</p>
            <ChevronDown className="size-2.5 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-[-75px] rounded-[8px] w-[240px]  border border-border-default shadow-lg bg-layout-color p-[4px]">
          <DropdownMenuItem
            className="text-[#53B1FD] text-sm font-semibold h-[38px] focus:text-[#53B1FD] cursor-pointer border border-transparent focus:rounded-[4px] focus:bg-color-hover"
            onClick={handleLoginAll}
          >
            <LogIn />
            <span className="ml-[6px]">Log In All</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[#F97066] text-sm font-semibold h-[38px] focus:text-[#F97066] cursor-pointer border border-transparent focus:rounded-[4px] focus:bg-color-hover"
            onClick={handleLogoutAll}
          >
            <LogOut />
            <span className="ml-[6px]">Log Out All</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="border border-border-default" />
          <DropdownMenuItem
            className="text-[#FDB022] text-sm font-semibold h-[38px] focus:text-[#FDB022] cursor-pointer border border-transparent focus:rounded-[4px] focus:bg-color-hover"
            onClick={handleDelayLoginAll}
          >
            <DelayLogin />
            <span className="ml-[6px]">Delayed Log In All</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="border border-border-default" />
          <DropdownMenuItem
            className="text-[#CECFD2] text-sm font-semibold h-[38px] focus:text-[#CECFD2] cursor-pointer border border-transparent focus:rounded-[4px] focus:bg-color-hover"
            onClick={() => setScheduledLoginLogoutSettingOpen(true)}
          >
            <Settings className="w-[16px] h-[16px]" />
            <span className="ml-[6px]">Scheduled Log In / Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isScheduledLoginLogoutSettingOpen && (
        <ScheduledLoginLogoutSetting onClose={() => setScheduledLoginLogoutSettingOpen(false)} />
      )}
    </>
  )
}
