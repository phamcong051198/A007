import { Button } from '@renderer/components/ui/button'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { SettingType } from '@shared/common/types'
import { useEffect, useRef, useState } from 'react'

export default function ProxyServerSettingsGeneral() {
  const [focusedInput, setFocusedInput] = useState<string | null>('ipAddress')
  const [formData, setFormData] = useState({
    ipAddress: '',
    port: '0',
    username: '',
    password: ''
  })

  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const data = (await window.electron.ipcRenderer.invoke('GetDataSetting')) as SettingType[]
      if (data.length > 0) {
        setFormData({
          ipAddress: data[0].ipAddress,
          port: data[0].port,
          username: data[0].username,
          password: data[0].password
        })
      }
    }

    fetchData()

    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetDataSetting')
    }
  }, [])

  const handleOk = () => {
    window.electron.ipcRenderer.send('UpdateDataProxyServerSettingsGeneral', formData)
  }

  return (
    <div className="flex flex-col bg-layout-color px-2 pt-5 h-full">
      <div>
        <BoxLabel label="Setting" className="w-full h-[333px]">
          <div className="pt-4 pb-3 pl-6 flex flex-col gap-4">
            <div className="flex">
              <p className="w-20">IP Address</p>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.ipAddress}
                onChange={(e) => setFormData((prev) => ({ ...prev, ipAddress: e.target.value }))}
                className="outline-none pl-1 border-b-2 border-gray-300 focus:border-blue-500"
                onFocus={() => setFocusedInput('ipAddress')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
            <div className="flex">
              <p className="w-20">Port</p>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => setFormData((prev) => ({ ...prev, port: e.target.value }))}
                className="outline-none pl-1 border-b-2 border-gray-300 focus:border-blue-500"
                onFocus={() => setFocusedInput('port')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
            <div className="flex">
              <p className="w-20">Username</p>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="outline-none pl-1 border-b-2 border-gray-300 focus:border-blue-500"
                onFocus={() => setFocusedInput('username')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
            <div className="flex">
              <p className="w-20">Password</p>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="outline-none pl-1 border-b-2 border-gray-300 focus:border-blue-500"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
          </div>
        </BoxLabel>
      </div>
      <div className="absolute bottom-4 right-5">
        <Button
          variant="outline"
          onClick={handleOk}
          className={`border border-solid py-0 px-8 leading-none h-7 w-20 ${
            focusedInput ? 'border-blue-500' : 'border-gray-400'
          }`}
        >
          OK
        </Button>
      </div>
    </div>
  )
}
