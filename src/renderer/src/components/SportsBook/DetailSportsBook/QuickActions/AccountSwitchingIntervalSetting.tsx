import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DropdownMenuItem } from '@renderer/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import { DataPlatformType } from '@shared/common/types'
import ClockPlus from '@renderer/icons/clock-plus'
import { InputNumber } from '@renderer/components/ui/input-number'
import { Button } from '@renderer/components/ui/button'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

function AccountSwitchingIntervalSetting({ sportsBook }: { sportsBook: DataPlatformType }) {
  const { id: sportsBookId } = useParams()
  const [openModalSetting, setOpenModalSetting] = useState(false)

  const [switchingFrom, setSwitchingFrom] = useState<string>('0')
  const [switchingTo, setSwitchingTo] = useState<string>('0')

  useEffect(() => {
    const fetchListAccount = async () => {
      const data = await window.electron.ipcRenderer.invoke(
        'DataSwitchIntervalSetting',
        sportsBook.platform
      )

      if (data) {
        setSwitchingFrom(data.switchIntervalSetting_from)
        setSwitchingTo(data.switchIntervalSetting_to)
      }
    }
    fetchListAccount()
  }, [openModalSetting])

  const handleFromChange = (value: number) => {
    setSwitchingFrom(String(value))
  }

  const handleDelayToChange = (value: number) => {
    setSwitchingTo(String(value))
  }

  const handleOk = () => {
    let newSwitchingFrom = switchingFrom === '' ? 1 : parseInt(String(switchingFrom), 10)
    let newSwitchingTo = switchingTo === '' ? 1 : parseInt(String(switchingTo), 10)

    if (newSwitchingFrom <= 0) newSwitchingFrom = 1
    if (newSwitchingTo <= 0) newSwitchingTo = 1

    if (newSwitchingFrom > 9999) newSwitchingFrom = 9999
    if (newSwitchingTo > 9999) newSwitchingTo = 9999

    if (newSwitchingTo < newSwitchingFrom) {
      newSwitchingTo = newSwitchingFrom
    }

    newSwitchingFrom = Math.floor(newSwitchingFrom)
    newSwitchingTo = Math.floor(newSwitchingTo)

    setSwitchingFrom(newSwitchingFrom + '')
    setSwitchingTo(newSwitchingTo + '')
    const randomTime = getRandomTime(newSwitchingFrom, newSwitchingTo)
    window.electron.ipcRenderer.send('DataUpdateSwitchIntervalSetting', {
      sportsBookId,
      platform: sportsBook.platform,
      switchIntervalSetting_from: newSwitchingFrom + '',
      switchIntervalSetting_to: newSwitchingTo + '',
      switchIntervalSettingMinutes: randomTime + ''
    })

    setOpenModalSetting(false)
  }

  function getRandomTime(newSwitchingFrom: number, newSwitchingTo: number): number {
    const min = Math.ceil(newSwitchingFrom)
    const max = Math.floor(newSwitchingTo)
    return Math.floor(Math.random() * (max - min + 1)) + min
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
        Account Switching Interval
      </DropdownMenuItem>

      <AlertDialog open={openModalSetting}>
        <AlertDialogContent className="p-0 rounded-[12px] h-[266px] w-[480px] border-border-default bg-black flex flex-col justify-between gap-0">
          <header>
            <div className="flex px-[24px] py-[20px]">
              <div>
                <ClockPlus />
              </div>
              <div className="ml-[16px] flex flex-col">
                <div className="flex justify-between">
                  <p className="text-lg font-semibold text-[#F7F7F7]">Account Switching Interval</p>
                  <button
                    className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                    onClick={() => setOpenModalSetting(false)}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-[#94979C]">
                  Set the delay time between login attempts to manage switching intervals and
                  improve account security.
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 px-[24px] flex gap-[12px]">
            <div className="flex-1">
              <label className="text-sm">Switching from (min.)</label>

              <InputNumber
                precision={0}
                min={1}
                max={9999}
                value={Number(switchingFrom)}
                onChange={(value) => handleFromChange(value)}
              />
            </div>
            <div className="flex-1 ">
              <label className="text-sm">to (min.)</label>
              <InputNumber
                precision={0}
                min={1}
                max={9999}
                value={Number(switchingTo)}
                onChange={(value) => handleDelayToChange(value)}
              />
            </div>
          </main>

          <footer className="flex gap-[12px] px-[24px] pb-[24px] ">
            <Button
              className="w-1/2"
              onClick={() => setOpenModalSetting(false)}
              variant="bordered-white"
            >
              Cancel
            </Button>
            <Button className="w-1/2" onClick={handleOk}>
              Save
            </Button>
          </footer>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default AccountSwitchingIntervalSetting
