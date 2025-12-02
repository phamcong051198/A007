import AccountList from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/AccountList'
import ProxySetting from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/ProxySetting'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import ChevronDown from '@renderer/icons/chevron-down'

import { DataPlatformType } from '@shared/common/types'

export default function QuickActionsPlatform({ sportsBook }: { sportsBook: DataPlatformType }) {
  const handleLoginAll_Platform = () => {
    window.electron.ipcRenderer.send('LoginAll_Platform', sportsBook.platform)
  }

  const handleLogoutAll_Platform = () => {
    window.electron.ipcRenderer.send('LogoutAll_Platform', sportsBook.platform)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`${'hover:border-blue-color'} w-[130px] h-[35px] bg-black text-sm rounded-[8px] border border-border-default text-white hover:opacity-90`}
      >
        <div className="flex items-center justify-center gap-[4px]">
          <p>Quick Actions</p>
          <ChevronDown className="size-2.5 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ml-[120px] w-[270px] border border-border-default text-text-default bg-black rounded-lg">
        <DropdownMenuItem
          className="font-bold cursor-pointer focus:text-blue-color focus:bg-[#22262F] px-[16px] py-[8px] rounded-[4px] text-blue-color text-sm"
          onClick={handleLoginAll_Platform}
        >
          Login All
        </DropdownMenuItem>
        <DropdownMenuItem
          className="font-bold cursor-pointer focus:text-red-color focus:bg-[#22262F] px-[16px] py-[8px] rounded-[4px] text-red-color text-sm"
          onClick={handleLogoutAll_Platform}
        >
          Logout All
        </DropdownMenuItem>
        <DropdownMenuSeparator className="border border-border-default" />
        <AccountList sportsBook={sportsBook} />
        <DropdownMenuSeparator className="border border-border-default" />

        <ProxySetting sportsBook={sportsBook} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
