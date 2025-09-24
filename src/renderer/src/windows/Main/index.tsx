import { useEffect, useState } from 'react'

import AppLayout from '@renderer/layouts/AppLayout'
import DialogWithCountdown from '@renderer/components/Dialog/DialogWithCountdownProps'
import { useCount } from '@renderer/context/CountContext'
import SessionExpirePopup from '@renderer/components/Dialog/SessionExpirePopup'

export default function Main() {
  const { setTotalBetList, setTotalWaitingList, setTotalContraList, setTotalSuccessList } =
    useCount()

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

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
  useEffect(() => {
    window.electron.onForceLogout((_event, data) => {
      if (data.message) {
        setMessage(data.message)

        setOpen(true)

        setTimeout(() => {
          window.electron.ipcRenderer.send('CloseAppByToken')
        }, 5000)
      }
    })
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.on('ShowForceLogoutMessage', (message) => {
      alert(message || 'You have been logged out by server.')
    })
  }, [])

  const [sessionPopup, setSessionPopup] = useState<{
    expiredDate: string
    autoCloseMs: number
  } | null>(null)

  useEffect(() => {
    window.electron.ipcRenderer.on('show-session-expire-popup', (_event, payload) => {
      setSessionPopup(payload)
    })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('show-session-expire-popup')
    }
  }, [])

  return (
    <>
      <AppLayout />
      {sessionPopup && (
        <SessionExpirePopup
          expiredDate={sessionPopup.expiredDate}
          autoCloseMs={sessionPopup.autoCloseMs}
          onClose={() => setSessionPopup(null)}
        />
      )}
      {open && (
        <DialogWithCountdown
          open={open}
          setOpen={() => setOpen(false)}
          message={message || 'Your session has expired, please login again.'}
        />
      )}
    </>
  )
}
