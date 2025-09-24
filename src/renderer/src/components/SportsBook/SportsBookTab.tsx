import DetailSportsBook from '@renderer/components/SportsBook/DetailSportsBook'
import { AccountUpdateProvider } from '@renderer/context/AccountContext'
import { AccountType, DataPlatformType } from '@shared/common/types'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function SportsBookTab() {
  const { id: activeId } = useParams()

  const [dataSportBook, setDataSportBook] = useState<DataPlatformType[]>([])

  const fetchData = async () => {
    const data = await window.electron.ipcRenderer.invoke('GetDataSportsBook')
    setDataSportBook(data)
  }

  useEffect(() => {
    // Listener cho DataSportsBook
    const listener = (_, newData: DataPlatformType[]) => {
      setDataSportBook(newData)
    }
    window.electron.ipcRenderer.on('DataSportsBook', listener)

    // Listener cho DataUpdateSwitch
    const handleDataLog = (_: unknown, data: AccountType) => {
      if (data.platformName) {
        fetchData()
      }
    }
    window.electron.ipcRenderer.on('DataUpdateSwitch', handleDataLog)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('DataSportsBook')
      window.electron.ipcRenderer.removeAllListeners('DataUpdateSwitch')
    }
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.send('SetActiveSportsbookTab', activeId)
    return () => {
      window.electron.ipcRenderer.removeAllListeners('SetActiveSportsbookTab')
    }
  }, [activeId])

  useEffect(() => {
    fetchData()

    const updateListener = (_, data) => {
      setDataSportBook(data)
    }
    window.electron.ipcRenderer.on('GetDataSportsBookUpdate', updateListener)
    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetDataSportsBookUpdate')
    }
  }, [activeId])

  return (
    <div className="w-full">
      <div className="overflow-y-auto custom-scrollbar">
        <AccountUpdateProvider>
          {dataSportBook.map((sportsBook) => (
            <DetailSportsBook key={sportsBook.id} sportsBook={sportsBook} />
          ))}
        </AccountUpdateProvider>
      </div>
    </div>
  )
}
