import { useEffect } from 'react'
import AppLayout from '@renderer/layouts/AppLayout'

import { useCount } from '@renderer/context/CountContext'

export default function Main() {
  const { setTotalBetList, setTotalWaitingList, setTotalContraList, setTotalSuccessList } =
    useCount()

  useEffect(() => {
    const listenerMapping = [
      { event: 'TotalBetList', setState: setTotalBetList },
      { event: 'TotalWaitingList', setState: setTotalWaitingList },
      { event: 'TotalContraList', setState: setTotalContraList },
      { event: 'TotalSuccessList', setState: setTotalSuccessList }
    ]

    listenerMapping.forEach(({ event, setState }) => {
      window.electron.ipcRenderer.on(event, (_, data: number) => {
        if (event === 'TotalWaitingList') {
          setState(data)
        } else {
          setState((prev) => prev + 1)
        }
      })
    })

    return () => {
      listenerMapping.forEach(({ event }) => {
        window.electron.ipcRenderer.removeAllListeners(event)
      })
    }
  }, [])

  return <AppLayout />
}
