import React, { useContext, useState } from 'react'
import { Button } from '../ui/button'

import InputRangePlatform from './components/InputRangePlatform'
import OtherSetting from './components/OtherSetting'
import { BetSettingContext } from '@renderer/context/BetSettingContext'
import { CheckCircle } from 'lucide-react'

export default function BetSetting() {
  const context = useContext(BetSettingContext)
  if (!context) return null

  const { listRangePlatform, setListRangePlatform } = context.RangePlatform
  const { otherSetting } = context.OtherSetting
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
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

    setShowSaveSuccess(true)
    setMessageSuccess('Save successful!')
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 1500)
  }
  const handleCancel = () => {
    window.history.back()
  }
  return (
    <>
      <div className="bg-layout-color flex flex-col">
        <h1 className="text-lg font-bold mb-5 border-b pb-5 border-b-[#22262F]">
          Priority Manager
        </h1>
        <div className="flex-1  pb-5 border-b-[#22262F]">
          <InputRangePlatform />
        </div>
        <div className="flex-1 pb-5 border-b-[#22262F]">
          <OtherSetting />
        </div>
        <div className="flex justify-end space-x-2 mt-4 py-5 pr-5">
          <Button variant="plain-white" size="sm" className="text-white" onClick={reset}>
            Reset all changes
          </Button>
          <Button variant="bordered-white" size="sm" className="border-red" onClick={handleCancel}>
            Cancel
          </Button>

          <Button size="sm" onClick={save}>
            Save
          </Button>
        </div>
        {showSaveSuccess && (
          <div className="fixed top-[5%] right-[2%] bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-pulse">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>{messageSuccess}</span>
          </div>
        )}
      </div>
    </>
  )
}
