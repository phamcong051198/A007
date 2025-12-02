import { createContext, useEffect, useState } from 'react'

import { SettingType } from '@shared/common/types'

interface SchedulerContextType {
  oddsTypeSetting: {
    profitMin: string
    setProfitMin: (value: string) => void
    profitMax: string
    setProfitMax: (value: string) => void
  }
  gameType: { gameType: string; setGameType: (value: string) => void }
}

export const SettingContext = createContext<SchedulerContextType | undefined>(undefined)

export const SettingProvider = ({ children }) => {
  const [profitMin, setProfitMin] = useState<string>('')
  const [profitMax, setProfitMax] = useState<string>('')
  const [gameType, setGameType] = useState<string>('None')

  useEffect(() => {
    const fetchData = async () => {
      const data = (await window.electron.ipcRenderer.invoke('GetDataSetting')) as SettingType[]

      if (data.length > 0) {
        const settings = data[0]
        setProfitMin(settings.profitMin)
        setProfitMax(settings.profitMax)
        setGameType(settings.gameType)
      }
    }

    fetchData()

    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetDataSetting')
    }
  }, [])

  const contextValue: SchedulerContextType = {
    gameType: { gameType, setGameType },
    oddsTypeSetting: { profitMax, profitMin, setProfitMax, setProfitMin }
  }

  return <SettingContext.Provider value={contextValue}>{children}</SettingContext.Provider>
}
