import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { SettingType } from '@shared/common/types'
import { CheckCircle } from 'lucide-react'
export default function ProxySetting() {
  const [focusedInput, setFocusedInput] = useState<string | null>('ipAddress')
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
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

    setShowSaveSuccess(true)
    setMessageSuccess('Save successful!')
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 1500)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 mb-4 border-b  border-b-[#22262F] ">
        <div className="flex flex-col space-y-6 p-4 pl-0">
          <div className="flex">
            <div className="w-1/3 text-[#F7F7F7] text-base font-semibold">
              Proxy server settings
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mb-4 border-b  border-b-[#22262F] ">
        <div className="flex flex-col space-y-8 p-4 pl-0">
          <div className="flex  border-b  border-b-[#22262F] pb-6">
            <div className="w-1/3">IP Address</div>
            <div className="w-1/3">
              <Input
                ref={firstInputRef}
                value={formData.ipAddress}
                onChange={(e) => setFormData((prev) => ({ ...prev, ipAddress: e.target.value }))}
                onFocus={() => setFocusedInput('ipAddress')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
          </div>
          <div className="flex  border-b  border-b-[#22262F] pb-6">
            <div className="w-1/3">Port</div>
            <div className="w-1/3">
              <Input
                value={formData.port}
                onChange={(e) => setFormData((prev) => ({ ...prev, port: e.target.value }))}
                onFocus={() => setFocusedInput('port')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
          </div>
          <div className="flex  border-b  border-b-[#22262F]  pb-6">
            <div className="w-1/3">Username</div>
            <div className="w-1/3">
              <Input
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                onFocus={() => setFocusedInput('username')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
          </div>
          <div className="flex pb-6">
            <div className="w-1/3">Password</div>
            <div className="w-1/3">
              <Input
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4 py-5 pr-5">
        <Button variant="bordered-white" size="sm" className="border-red">
          Cancel
        </Button>

        <Button size="sm" onClick={handleOk}>
          Save
        </Button>
      </div>
      {showSaveSuccess && (
        <div className="fixed top-[5%] right-[2%] bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-pulse">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{messageSuccess}</span>
        </div>
      )}
    </>
  )
}
