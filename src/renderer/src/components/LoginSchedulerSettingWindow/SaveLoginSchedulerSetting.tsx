import { Button } from '@renderer/components/ui/button'
import { LoginSchedulerSettingContext } from '@renderer/context/LoginSchedulerSettingContext'
import { CheckCircle } from 'lucide-react'
import React, { useContext, useState } from 'react'

const SaveLoginSchedulerSetting = () => {
  const context = useContext(LoginSchedulerSettingContext)
  if (!context) return null
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const handleOK = () => {
    const dataSaveLoginSchedulerSetting = [
      {
        typeSetting: 'Login',
        isSchedulerEnabled: Number(context.loginSetting.loginScheduler.isSchedulerEnabled),
        selectedDays: JSON.stringify(context.loginSetting.loginScheduler.selectedDays),
        timeValue: context.loginSetting.loginScheduler.timeValue,
        dateValue: context.loginSetting.loginScheduler.dateValue
      },
      {
        typeSetting: 'Logout',
        isSchedulerEnabled: Number(context.logoutSetting.logoutScheduler.isSchedulerEnabled),
        selectedDays: JSON.stringify(context.logoutSetting.logoutScheduler.selectedDays),
        timeValue: context.logoutSetting.logoutScheduler.timeValue,
        dateValue: context.logoutSetting.logoutScheduler.dateValue
      }
    ]

    window.electron.ipcRenderer.send('DataSaveLoginSchedulerSetting', dataSaveLoginSchedulerSetting)
    setShowSaveSuccess(true)
    setMessageSuccess('Save successful!')
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 1500)
  }
  return (
    <>
      <Button variant="default" onClick={handleOK} className="px-4">
        OK
      </Button>
      {showSaveSuccess && (
        <div className="fixed top-[5%] right-[2%] bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-pulse">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{messageSuccess}</span>
        </div>
      )}
    </>
  )
}

export default React.memo(SaveLoginSchedulerSetting)
