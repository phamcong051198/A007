import { Button } from '@renderer/components/ui/button'
import { PerMatchLimitSettingContext } from '@renderer/context/PerMatchLimitSettingContext'
import { validateAndUpdateData } from '@renderer/lib/validateAndUpdateData'
import React, { useContext } from 'react'

const FooterSave = () => {
  const context = useContext(PerMatchLimitSettingContext)
  if (!context) return null

  const { showDisable, listPlatform } = context

  const handleSave = () => {
    const updatedListPlatform = listPlatform.map(validateAndUpdateData)
    window.electron.ipcRenderer.send('CloseSportsBookPerMatchLimitSetting', {
      enable: +showDisable,
      listPlatform: updatedListPlatform
    })
  }

  return (
    <Button
      variant="outline"
      className="bg-white border border-gray-400 border-solid h-6 w-20 hover:border-blue-500 leading-none mr-2 my-2 px-8"
      onClick={handleSave}
    >
      OK
    </Button>
  )
}

export default React.memo(FooterSave)
