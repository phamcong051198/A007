import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import ChevronDown from '@renderer/icons/chevron-down'
import LogIn from '@renderer/icons/log-in'
import LogOut from '@renderer/icons/log-out'

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
          className={`${'hover:border-blue-color'} w-[160px] h-[35px] text-sm rounded-[8px] bg-white border border-border-default mr-[12px] hover:opacity-90  `}
        >
          <div className="flex items-center justify-center gap-[4px]">
            <p>Quick Actions</p>
            <ChevronDown className="size-2.5 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-[-20px] rounded-[8px] w-[180px] border border-border-default shadow-lg bg-white p-[2px]">
          <DropdownMenuItem
            className="text-blue-color text-sm font-medium h-[26px] focus:text-blue-color cursor-pointer border border-transparent focus:rounded-[4px] focus:bg-hover-default"
            onClick={handleLoginAll}
          >
            <LogIn />
            <span className="ml-[4px]">Log In All</span>
          </DropdownMenuItem>
          <div className="border-t border-border-default my-[2px]" />
          <DropdownMenuItem
            className="text-red-color text-sm font-medium h-[26px] focus:text-red-color cursor-pointer border border-transparent focus:rounded-[4px] focus:bg-hover-default"
            onClick={handleLogoutAll}
          >
            <LogOut />
            <span className="ml-[4px]">Log Out All</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
