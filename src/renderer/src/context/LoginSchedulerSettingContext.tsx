import { LoginSchedulerSettingType } from '@shared/common/types'
import { createContext, useEffect, useState } from 'react'

interface SchedulerState {
  isSchedulerEnabled: boolean
  selectedDays: string[]
  clickedDay: string | null
  timeValue: string
  dateValue: string
}

interface SchedulerContextType {
  loginSetting: {
    loginScheduler: SchedulerState
    setLoginScheduler: (value: Partial<SchedulerState>) => void
  }
  logoutSetting: {
    logoutScheduler: SchedulerState
    setLogoutScheduler: (value: Partial<SchedulerState>) => void
  }
}

export const LoginSchedulerSettingContext = createContext<SchedulerContextType | undefined>(
  undefined
)

export const LoginSchedulerSettingContextProvider = ({ children }) => {
  const [loginScheduler, setLoginScheduler] = useState<SchedulerState>({
    isSchedulerEnabled: false,
    selectedDays: [],
    clickedDay: null,
    timeValue: '00:00',
    dateValue: new Date().toISOString().split('T')[0]
  })

  const [logoutScheduler, setLogoutScheduler] = useState<SchedulerState>({
    isSchedulerEnabled: false,
    selectedDays: [],
    clickedDay: null,
    timeValue: '00:00',
    dateValue: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const fetchData = async () => {
      const data = (await window.electron.ipcRenderer.invoke(
        'GetDataLoginSchedulerSetting'
      )) as LoginSchedulerSettingType[]
      const dataLoginSchedulerSetting = data.find((item) => item.typeSetting === 'Login')
      const dataLogoutSchedulerSetting = data.find((item) => item.typeSetting === 'Logout')

      if (dataLoginSchedulerSetting && dataLogoutSchedulerSetting) {
        setLoginScheduler({
          isSchedulerEnabled: Boolean(dataLoginSchedulerSetting.isSchedulerEnabled),
          selectedDays: JSON.parse(dataLoginSchedulerSetting.selectedDays),
          clickedDay: null,
          timeValue: dataLoginSchedulerSetting.timeValue,
          dateValue: dataLoginSchedulerSetting.dateValue
        })

        setLogoutScheduler({
          isSchedulerEnabled: Boolean(dataLogoutSchedulerSetting.isSchedulerEnabled),
          selectedDays: JSON.parse(dataLogoutSchedulerSetting.selectedDays),
          clickedDay: null,
          timeValue: dataLogoutSchedulerSetting.timeValue,
          dateValue: dataLogoutSchedulerSetting.dateValue
        })
      }
    }
    fetchData()

    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetDataLoginSchedulerSetting')
    }
  }, [])

  const contextValue: SchedulerContextType = {
    loginSetting: {
      loginScheduler,
      setLoginScheduler: (value: Partial<SchedulerState>) => {
        setLoginScheduler((prev) => ({ ...prev, ...value }))
      }
    },

    logoutSetting: {
      logoutScheduler,
      setLogoutScheduler: (value: Partial<SchedulerState>) => {
        setLogoutScheduler((prev) => ({ ...prev, ...value }))
      }
    }
  }
  return (
    <LoginSchedulerSettingContext.Provider value={contextValue}>
      {children}
    </LoginSchedulerSettingContext.Provider>
  )
}
