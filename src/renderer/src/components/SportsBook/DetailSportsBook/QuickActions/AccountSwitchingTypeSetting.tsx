import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DropdownMenuItem } from '@renderer/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import { DataPlatformType } from '@shared/common/types'
import SwitchHorizontalBorder from '@renderer/icons/switch-horizontal-border'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'

const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

function AccountSwitchingTypeSetting({ sportsBook }: { sportsBook: DataPlatformType }) {
  const { id: sportsBookId } = useParams()
  const [openModalSetting, setOpenModalSetting] = useState(false)

  const [accountType, setAccountType] = useState<string>('All')
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  useEffect(() => {
    const fetchListAccount = async () => {
      const data = await window.electron.ipcRenderer.invoke(
        'DataSwitchIntervalSetting',
        sportsBook.platform
      )
      if (data) {
        setAccountType(data.accountType)
      }
    }
    fetchListAccount()
  }, [openModalSetting])

  const handleChange = (value: string) => {
    setAccountType(value)
  }

  const handleOk = () => {
    window.electron.ipcRenderer.send('DataUpdateSwitchTypeSetting', {
      sportsBookId,
      platform: sportsBook.platform,
      accountType: accountType
    })

    setOpenModalSetting(false)
  }

  const accountTypeLabels: Record<string, string> = {
    All: 'All Accounts',
    Betting: 'Betting Accounts Only',
    Refresh: 'Refresh Accounts Only'
  }

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          setOpenModalSetting(true)
        }}
        className="font-semibold cursor-pointer focus:text-white focus:bg-[#22262F] px-[16px] py-[8px] rounded-[4px]"
        onClick={() => setOpenModalSetting(true)}
      >
        Account Switching Type
      </DropdownMenuItem>

      <AlertDialog open={openModalSetting}>
        <AlertDialogContent className="p-0 rounded-[12px] h-[266px] w-[380px] border-border-default bg-black flex flex-col justify-between gap-0">
          <header>
            <div className="flex px-[24px] py-[20px]">
              <div>
                <SwitchHorizontalBorder />
              </div>
              <div className="ml-[16px] flex flex-col">
                <div className="flex justify-between">
                  <p className="text-lg font-semibold text-[#F7F7F7]">Account Switching Type</p>
                  <button
                    className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                    onClick={() => setOpenModalSetting(false)}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-[#94979C]">
                  Select the appropriate account type configuration for account switching mode.
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 px-[24px] flex gap-[12px]">
            <div className="flex-1">
              <div className="">Account type</div>
              <Select
                onValueChange={handleChange}
                onOpenChange={(open) => setIsSelectOpen(open)}
                value={accountType as string}
              >
                <SelectTrigger className="h-[48px] focus:ring-0 border p-0">
                  <SelectValue placeholder="None">
                    {accountTypeLabels[accountType] || 'All Accounts'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="All"
                    className=" border border-white  focus:bg-blue-500 focus:text-white p-[1px] m-0 w-full"
                  >
                    All Account
                  </SelectItem>
                  <SelectItem
                    value="Betting"
                    className=" border border-white  focus:bg-blue-500 focus:text-white  p-[1px] m-0 w-full"
                  >
                    Betting Accounts Only
                  </SelectItem>
                  <SelectItem
                    value="Refresh"
                    className=" border border-white  focus:bg-blue-500 focus:text-white  p-[1px] m-0 w-full"
                  >
                    Refresh Accounts Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </main>

          <footer className="flex gap-[12px] px-[24px] pb-[24px]">
            <button
              className="flex-1 outline-none border border-border-default hover:border-gray-700 block h-[40px] font-semibold rounded-[8px]"
              onClick={() => setOpenModalSetting(false)}
            >
              Cancel
            </button>
            <button
              className={`${isBSoft ? 'bg-blue-color' : 'bg-purple-color'} flex-1 border-none block h-[40px] font-semibold  hover:bg-opacity-90 rounded-[8px]`}
              onClick={handleOk}
            >
              Save
            </button>
          </footer>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default AccountSwitchingTypeSetting
