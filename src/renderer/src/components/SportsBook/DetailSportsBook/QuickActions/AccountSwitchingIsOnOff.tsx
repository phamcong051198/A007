import { useEffect, useState } from 'react'
import { DropdownMenuItem } from '@renderer/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import { DataPlatformType } from '@shared/common/types'
import SearchBorderLg from '@renderer/icons/search-border-lg'
import { useParams } from 'react-router-dom'
import SwitchHorizontalBorder from '@renderer/icons/switch-horizontal-border'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

function AccountSwitchingIsOnOff({ sportsBook }: { sportsBook: DataPlatformType }) {
  const { id: sportsBookId } = useParams()

  const [openModalSetting, setOpenModalSetting] = useState(false)
  const [settingOff, setSettingOff] = useState<'on' | 'off'>('off')

  useEffect(() => {
    const fetchListAccount = async () => {
      const data = await window.electron.ipcRenderer.invoke(
        'DataSwitchIntervalSetting',
        sportsBook.platform
      )
      if (data) {
        setSettingOff(data.switchAccountSetting)
      }
    }
    fetchListAccount()
  }, [openModalSetting])

  const confirm = () => {
    window.electron.ipcRenderer.send('DataUpdateSwitchSettingOFF', {
      sportsBookId,
      platform: sportsBook.platform,
      switchAccountSetting: settingOff === 'off' ? 'on' : 'off'
    })
    setOpenModalSetting(false)
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
        Account Switching Is{' '}
        <span
          className={
            settingOff === 'on'
              ? 'text-blue-500 pl-2 font-semibold'
              : 'text-red-500 font-semibold pl-2'
          }
        >
          {settingOff.toUpperCase()}
        </span>
      </DropdownMenuItem>

      <AlertDialog open={openModalSetting}>
        <AlertDialogContent className="p-0 rounded-[12px] h-[216px] w-[480px] border-border-default bg-black flex flex-col justify-between gap-0">
          <header>
            <div className="flex flex-col justify-between items-center px-[24px] pt-[24px]">
              <SwitchHorizontalBorder />
              <div className="ml-[16px] mt-4 flex flex-col">
                <div className="flex justify-between">
                  <p className="text-lg font-semibold text-[#F7F7F7]">
                    Turn {settingOff == 'on' ? 'off' : 'on'} account switching?
                  </p>
                  <button
                    className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                    onClick={() => setOpenModalSetting(false)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </header>

          <footer className="flex gap-[12px] px-[24px] pb-[24px]">
            <button
              className="flex-1 outline-none border border-border-default hover:border-gray-700 block h-[40px] font-semibold rounded-[8px]"
              onClick={() => setOpenModalSetting(false)}
            >
              Cancel
            </button>
            <button
              className={`${isBSoft ? 'bg-blue-color' : 'bg-purple-color'} flex-1 border-none block h-[40px] font-semibold  hover:bg-opacity-90 rounded-[8px]`}
              onClick={confirm}
            >
              Confirm
            </button>
          </footer>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default AccountSwitchingIsOnOff
