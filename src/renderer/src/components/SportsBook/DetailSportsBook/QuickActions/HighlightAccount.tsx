import { useEffect, useState } from 'react'
import { DropdownMenuItem } from '@renderer/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import SearchBorderLg from '@renderer/icons/search-border-lg'
import { SportsBookType } from '@shared/common/types'
import { useParams } from 'react-router-dom'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

function HighlightAccount({ sportsBook }: { sportsBook: SportsBookType }) {
  const { id: sportsBookId } = useParams()

  const [openModalSetting, setOpenModalSetting] = useState(false)
  const [formData, setFormData] = useState({
    hight_account: ''
  })

  useEffect(() => {
    const fetchListAccount = async () => {
      const data = await window.electron.ipcRenderer.invoke(
        'DataSwitchIntervalSetting',
        sportsBook.platform
      )

      if (data) {
        setFormData({ hight_account: data.hight_account })
      }
    }
    fetchListAccount()
  }, [])

  const closeModal = () => {
    setOpenModalSetting(false)
    setFormData({
      hight_account: ''
    })
  }

  const save = () => {
    window.electron.ipcRenderer.send('DataUpdateSwitchHighLight', {
      sportsBookId,
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
        Highlight Account
      </DropdownMenuItem>

      <AlertDialog open={openModalSetting}>
        <AlertDialogContent className="p-0 rounded-[12px] h-[280px] w-[480px] border-border-default bg-black flex flex-col gap-0">
          <header>
            <div className="flex flex-col justify-between items-center px-[24px] pt-[24px]">
              <SearchBorderLg />
              <div className="ml-[16px] mt-4 flex flex-col">
                <div className="flex justify-between">
                  <p className="text-lg font-semibold text-[#F7F7F7]">Highlight Account</p>
                  <button
                    className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className=" overflow-y-scroll px-[24px] py-[24px] flex flex-col gap-[16px]">
            <input
              placeholder="Username"
              className="flex-1 h-[44px] bg-transparent border border-border-default rounded-lg py-[10px] px-[14px] focus:border-gray-500"
              type="text"
              value={formData.hight_account}
              onChange={(e) => setFormData((prev) => ({ ...prev, hight_account: e.target.value }))}
            />
          </main>

          <footer className="flex gap-[12px] px-[24px] pb-[24px]">
            <button
              className="flex-1 outline-none border border-border-default hover:border-gray-700 block h-[40px] font-semibold rounded-[8px]"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className={`${isBSoft ? 'bg-blue-color' : 'bg-purple-color'} flex-1 border-none block h-[40px] font-semibold  hover:bg-opacity-90 rounded-[8px]`}
              onClick={save}
            >
              Confirm
            </button>
          </footer>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default HighlightAccount
