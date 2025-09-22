import AccountList from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/AccountList'
import AccountListSwitch from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/AccountListSwitch'
import AccountSwitchingIntervalSetting from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/AccountSwitchingIntervalSetting'
import AccountSwitchingIsOnOff from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/AccountSwitchingIsOnOff'
import AccountSwitchingTypeSetting from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/AccountSwitchingTypeSetting'
import DelayLoginSetting from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/DelayLoginSetting'
import HighlightAccount from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/HighlightAccount'
import ProxySetting from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/ProxySetting'
import VIPAccountCheckerSetting from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/VIPAccountCheckerSetting'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import ChevronDown from '@renderer/icons/chevron-down'
import { DataPlatformType } from '@shared/common/types'

const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

export default function QuickActionsPlatform({ sportsBook }: { sportsBook: DataPlatformType }) {
  const handleLoginAll_Platform = () => {
    window.electron.ipcRenderer.send('LoginAll_Platform', sportsBook.platform)
  }

  const handleLogoutAll_Platform = () => {
    window.electron.ipcRenderer.send('LogoutAll_Platform', sportsBook.platform)
  }

  const handleDelayeLoginAll_Platform = () => {
    window.electron.ipcRenderer.send('DelayLoginAll_Platform', sportsBook.platform)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`${isBSoft ? 'hover:border-blue-color' : 'hover:border-purple-color'} w-[130px] h-[35px] bg-layout-color text-sm rounded-[8px] border border-border-default text-white hover:opacity-90`}
      >
        <div className="flex items-center justify-center gap-[4px]">
          <p>Quick Actions</p>
          <ChevronDown className="size-2.5 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ml-[120px] w-[270px] border border-border-default text-text-default bg-layout-color rounded-lg">
        <DropdownMenuItem
          className="font-semibold cursor-pointer focus:text-white focus:bg-[#22262F] px-[16px] py-[8px] rounded-[4px]"
          onClick={handleLoginAll_Platform}
        >
          Login All
        </DropdownMenuItem>
        <DropdownMenuItem
          className="font-semibold cursor-pointer focus:text-white focus:bg-[#22262F] px-[16px] py-[8px] rounded-[4px]"
          onClick={handleLogoutAll_Platform}
        >
          Logout All
        </DropdownMenuItem>
        <DropdownMenuSeparator className="border border-border-default" />
        <DropdownMenuItem
          className="font-semibold cursor-pointer  focus:text-white focus:bg-[#22262F] px-[16px] py-[8px] rounded-[4px]"
          onClick={handleDelayeLoginAll_Platform}
        >
          Delayed Login All
        </DropdownMenuItem>

        <DelayLoginSetting sportsBook={sportsBook} />
        <DropdownMenuSeparator className="border border-border-default" />
        <AccountList sportsBook={sportsBook} />
        <VIPAccountCheckerSetting sportsBook={sportsBook} />

        <DropdownMenuSeparator className="border border-border-default" />

        <AccountListSwitch sportsBook={sportsBook} />
        <AccountSwitchingIntervalSetting sportsBook={sportsBook} />
        <AccountSwitchingTypeSetting sportsBook={sportsBook} />
        <AccountSwitchingIsOnOff sportsBook={sportsBook} />
        <HighlightAccount sportsBook={sportsBook} />

        <DropdownMenuSeparator className="border border-border-default" />

        <ProxySetting sportsBook={sportsBook} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
