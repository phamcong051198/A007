import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import ChevronDown from '@renderer/icons/chevron-down'
import LogIn from '@renderer/icons/log-in'
import LogOut from '@renderer/icons/log-out'
import Settings from '@renderer/icons/settings'

export default function QuickActions() {
  const handleLoginAll = () => {
    window.electron.ipcRenderer.send('LoginAll')
  }

  const handleLogoutAll = () => {
    window.electron.ipcRenderer.send('LogoutAll')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`${'hover:border-blue-color'} w-[165px] h-[40px] text-sm rounded-[8px] border border-border-default mr-[12px] text-white hover:opacity-90  `}
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
