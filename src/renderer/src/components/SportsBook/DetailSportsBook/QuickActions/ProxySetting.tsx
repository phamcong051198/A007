import { useState } from 'react'
import { DropdownMenuItem } from '@renderer/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import CheckCircle from '@renderer/icons/check-circle'
import { SportsBookType } from '@shared/common/types'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

function ProxySetting({ sportsBook }: { sportsBook: SportsBookType }) {
  const [formData, setFormData] = useState({
    ipAddress: '',
    port: '',
    username: '',
    password: ''
  })

  const [openModalSetting, setOpenModalSetting] = useState(false)

  const closeModal = () => {
    setOpenModalSetting(false)
    setFormData({
      ipAddress: '',
      port: '0',
      username: '',
      password: ''
    })
  }
  const save = () => {
    window.electron.ipcRenderer.send('Data_ProxyServerSetting_Platform', {
      platformName: sportsBook.platform,
      formData
    })
    closeModal()
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
        Quick Proxy Setting
      </DropdownMenuItem>

      <AlertDialog open={openModalSetting}>
        <AlertDialogContent className="p-0 rounded-[12px] h-[420px] w-[430px] border-border-default bg-black flex flex-col gap-0">
          <header>
            <div className="flex p-[16px]">
              <div>
                <CheckCircle />
              </div>
              <div className="ml-[16px] flex flex-col">
                <div className="flex justify-between">
                  <p className="text-lg font-semibold text-[#F7F7F7]">Proxy Settings</p>
                  <button
                    className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-[#94979C]">
                  Set proxy settings to control internet access and secure connections.
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-scroll px-[24px] pt-[24px] flex flex-col gap-[16px]">
            <div className="flex">
              <label className="font-medium w-[120px]">IP Address</label>
              <input
                className="flex-1 h-[40px] bg-transparent border border-border-default rounded-lg py-[10px] px-[14px] focus:border-gray-500"
                type="text"
                value={formData.ipAddress}
                onChange={(e) => setFormData((prev) => ({ ...prev, ipAddress: e.target.value }))}
              />
            </div>
            <div className="flex">
              <label className="font-medium w-[120px]">Port</label>
              <input
                className="flex-1 h-[40px] bg-transparent border border-border-default rounded-lg py-[10px] px-[14px] focus:border-gray-500"
                type="text"
                value={formData.port}
                onChange={(e) => setFormData((prev) => ({ ...prev, port: e.target.value }))}
              />
            </div>
            <div className="flex">
              <label className="font-medium w-[120px]">Username</label>
              <input
                className="flex-1 h-[40px] bg-transparent border border-border-default rounded-lg py-[10px] px-[14px] focus:border-gray-500"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="flex">
              <label className="font-medium w-[120px]">Password</label>
              <input
                className="flex-1 h-[40px] bg-transparent border border-border-default rounded-lg py-[10px] px-[14px] focus:border-gray-500"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </main>

          <footer className="flex gap-[12px] px-[24px] pb-[24px]">
            <button
              className="flex-1 outline-none border border-border-default hover:border-gray-700 block h-[40px] font-semibold rounded-[8px]"
              onClick={closeModal}
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

export default ProxySetting
