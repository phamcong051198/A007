import { Button } from '@renderer/components/ui/button'
import OtherSetting from '@renderer/components/BetSetting/OtherSetting'
import InputRangePlatform from '@renderer/components/BetSetting/InputRangePlatform'
import { useContext } from 'react'
import { BetSettingContext } from '@renderer/context/BetSettingContext'

export default function BetSetting() {
  const context = useContext(BetSettingContext)
  if (!context) return null

  const { listRangePlatform, setListRangePlatform } = context.RangePlatform
  const { otherSetting } = context.OtherSetting

  const reset = () => {
    setListRangePlatform((prev) =>
      prev.map((item) => ({
        ...item,
        valueRange: 0
      }))
    )
  }

  const save = () => {
    window.electron.ipcRenderer.send('DataBetSetting', {
      rangePlatforms: listRangePlatform,
      otherSetting
    })
  }
  return (
    <div className="flex flex-col h-full bg-layout-color">
      <div className="flex-1">
        <InputRangePlatform />
      </div>
      <div className="pt-[10px] border-t border-gray-200 bg-layout-color">
        <OtherSetting />
      </div>
      <div className="relative py-3">
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="border border-solid py-0 px-8 leading-none h-6 w-20 hover:border-blue-500 border-gray-400"
            onClick={save}
          >
            OK
          </Button>
        </div>

        <p
          className="mr-2 absolute right-0 top-1/2 -translate-y-1/2 text-blue-color underline cursor-pointer"
          onClick={reset}
        >
          Reset To Default
        </p>
      </div>
    </div>
  )
}
