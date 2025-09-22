import React, { useEffect, useState } from 'react'
import { DropdownMenuItem } from '@renderer/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import CheckCircle from '@renderer/icons/check-circle'
import { useParams } from 'react-router-dom'
import { SportsBookType } from '@shared/common/types'
import { Checkbox } from '@renderer/components/ui/checkbox'

const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

function VIPAccountCheckerSetting({ sportsBook }: { sportsBook: SportsBookType }) {
  const [openModalSetting, setOpenModalSetting] = useState(false)
  const [isAutoLogoutEnabled, setIsAutoLogoutEnabled] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.ipcRenderer.invoke(
        'VIPAccountCheckerSetting',
        sportsBook.platform
      )
      setIsAutoLogoutEnabled(Boolean(data))
    }
    fetchData()
  }, [openModalSetting])

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoLogoutEnabled(event.target.checked)
  }

  const save = () => {
    window.electron.ipcRenderer.send('updateVIPAccountCheckerSetting', {
      platform: sportsBook.platform,
      VIPAccountLogout: +isAutoLogoutEnabled
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
        VIP Account Checker Setting
      </DropdownMenuItem>

      <AlertDialog open={openModalSetting}>
        <AlertDialogContent className="p-0 rounded-[12px] h-[216px] w-[390px] border-border-default bg-black flex flex-col gap-0">
          <header className="flex px-[24px] py-[24px]">
            <CheckCircle />
            <div className="ml-[16px] flex flex-col">
              <div className="flex justify-between">
                <p className="text-lg font-semibold text-[#F7F7F7]">VIP Account settings</p>
                <button
                  className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                  onClick={() => setOpenModalSetting(false)}
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-[#94979C]">
                Special configuration for vip accounts when using login.
              </p>
            </div>
          </header>

          <main className="flex-1 px-[24px] pb-[14px] flex flex-col gap-[16px]">
            <div className="flex items-center justify-center">
              <Checkbox
                id="bordered-checkbox-1"
                className="mr-2"
                checked={isAutoLogoutEnabled}
                onCheckedChange={() => setIsAutoLogoutEnabled(!isAutoLogoutEnabled)}
              />

              <label htmlFor="bordered-checkbox-1" className=" font-medium cursor-pointer">
                Auto logout VIP Account
              </label>
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
              className={`${isBSoft ? 'bg-blue-color' : 'bg-purple-color'} text-white flex-1 border-none block h-[40px] font-semibold  hover:bg-opacity-90 rounded-[8px]`}
              onClick={save}
            >
              Save
            </button>
          </footer>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default VIPAccountCheckerSetting
