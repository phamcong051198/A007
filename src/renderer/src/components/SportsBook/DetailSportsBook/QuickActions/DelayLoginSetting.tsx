import React, { useEffect, useState } from 'react'
import { SportsBookType } from '@shared/common/types'
import { DropdownMenuItem } from '@renderer/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import ClockPlus from '@renderer/icons/clock-plus'
import { useParams } from 'react-router-dom'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

function DelayLoginSetting({ sportsBook }: { sportsBook: SportsBookType }) {
  const { id: sportsBookId } = useParams()

  const [openModalSetting, setOpenModalSetting] = useState(false)

  const [delayLoginFrom, setDelayLoginFrom] = useState<string>('0')
  const [delayLoginTo, setDelayLoginTo] = useState<string>('0')

  useEffect(() => {
    const fetchListAccount = async () => {
      const data = await window.electron.ipcRenderer.invoke(
        'DataDelayedLoginSetting',
        sportsBook.platform
      )

      if (data) {
        setDelayLoginFrom(data.delayLoginSec_from)
        setDelayLoginTo(data.delayLoginSec_to)
      }
    }
    fetchListAccount()
  }, [openModalSetting])

  const handleDelayFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelayLoginFrom(e.target.value)
  }

  const handleDelayToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelayLoginTo(e.target.value)
  }

  const save = () => {
    let newDelayLoginFrom = delayLoginFrom === '' ? 1 : parseInt(String(delayLoginFrom), 10)
    let newDelayLoginTo = delayLoginTo === '' ? 1 : parseInt(String(delayLoginTo), 10)

    if (newDelayLoginFrom <= 0) newDelayLoginFrom = 1
    if (newDelayLoginTo <= 0) newDelayLoginTo = 1

    if (newDelayLoginFrom > 9999) newDelayLoginFrom = 9999
    if (newDelayLoginTo > 9999) newDelayLoginTo = 9999

    if (newDelayLoginTo < newDelayLoginFrom) {
      newDelayLoginTo = newDelayLoginFrom
    }

    newDelayLoginFrom = Math.floor(newDelayLoginFrom)
    newDelayLoginTo = Math.floor(newDelayLoginTo)

    setDelayLoginFrom(newDelayLoginFrom + '')
    setDelayLoginTo(newDelayLoginTo + '')

    window.electron.ipcRenderer.send('DataUpdateDelayedLoginSetting', {
      sportsBookId,
      platform: sportsBook.platform,
      delayLoginSec_from: newDelayLoginFrom + '',
      delayLoginSec_to: newDelayLoginTo + ''
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
        Delayed Login Setting
      </DropdownMenuItem>

      <AlertDialog open={openModalSetting}>
        <AlertDialogContent className="p-0 px-[24px] rounded-[12px] h-[286px] w-[480px] border-border-default bg-black flex flex-col gap-0">
          <header className="flex py-[24px]">
            <ClockPlus />
            <div className="ml-[16px] flex flex-col">
              <div className="flex justify-between">
                <p className="text-lg font-semibold text-[#F7F7F7]"> Delayed Login Settings</p>
                <button
                  className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                  onClick={() => setOpenModalSetting(false)}
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-[#94979C]">
                Configure the delay time and conditions for login attempts.
              </p>
            </div>
          </header>

          <main className="flex-1 flex gap-[16px]">
            <div className="flex-1">
              <p className="font-medium ">Delay login from (sec.)</p>
              <input
                className="w-full h-[44px] bg-transparent border border-border-default rounded-lg py-[10px] px-[14px] focus:border-gray-500"
                type="number"
                id="quantity1"
                name="quantity1"
                min="1"
                max="9999"
                value={delayLoginFrom}
                onChange={handleDelayFromChange}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium ">to (sec.)</p>
              <input
                className="w-full h-[44px] bg-transparent border border-border-default rounded-lg py-[10px] px-[14px] focus:border-gray-500"
                type="number"
                id="quantity2"
                name="quantity2"
                min="1"
                max="9999"
                value={delayLoginTo}
                onChange={handleDelayToChange}
              />
            </div>
          </main>

          <footer className="flex gap-[16px] pb-[24px]">
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

export default DelayLoginSetting
