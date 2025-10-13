import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { SPORTS_BOOK_LIST } from '@shared/renderer/constants'
import AddSportsBook from '@renderer/components/SportsBook/AddSportsBook'
import QuickActions from '@renderer/components/SportsBook/QuickActions'
import { SwitchCustom } from '@renderer/components/ui/switch'
import { SettingType } from '@shared/common/types'

export default function SportsBook() {
  const [enable, setEnable] = useState(0)
  const [credit, setCredit] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const data = (await window.electron.ipcRenderer.invoke('GetDataSetting')) as SettingType[]
      setEnable(data[0].enable)
      setCredit(data[0].credit)
      setEditValue(data[0].credit)
    }

    fetchData()

    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetDataSetting')
    }
  }, [])

  const handleActionEnable = () => {
    setEnable((prev) => {
      const newValue = prev ? 0 : 1
      window.electron.ipcRenderer.send('UpdateEnable', newValue)
      return newValue
    })
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setCredit(editValue)
    window.electron.ipcRenderer.send('UpdateCredit', editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(credit)
    setIsEditing(false)
  }

  return (
    <div className="w-full bg-layout-color h-[calc(100vh-95px)]">
      <div className="mt-[24px] mx-[24px] h-full flex flex-col">
        <div className="mb-[24px]">
          <div className="flex justify-between ">
            <p className="text-2xl font-semibold">SportsBook</p>

            {/* Credit block */}
            {!isEditing ? (
              <div className="flex gap-2 items-center justify-between border border-border-default rounded-[8px] bg-[#13161B] px-2 w-48">
                <span className="font-bold text-white">{credit}</span>
                <button
                  className="px-2 py-1 bg-blue-color text-white rounded"
                  onClick={handleEditClick}
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center justify-between w-48">
                <input
                  type="number"
                  className="flex-1 border border-border-default px-2 py-[3px] rounded text-black"
                  value={editValue}
                  onChange={(e) => setEditValue(Number(e.target.value))}
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-500 text-white rounded"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Switch + actions */}
            <div className="flex items-center">
              <div className="mr-5">
                <SwitchCustom checked={Boolean(enable)} onCheckedChange={handleActionEnable} />
              </div>
              <QuickActions />
              <AddSportsBook />
            </div>
          </div>

          {/* Tabs */}
          <div className="min-w-[600px] border border-border-default rounded-[8px] bg-[#13161B] mt-[20px] px-[4px] flex gap-[3px] h-[44px] items-center">
            {SPORTS_BOOK_LIST.map(({ id, label }) => (
              <NavLink
                key={id}
                to={id}
                className={({ isActive }) => `
                  w-[114px] h-[36px] text-sm flex justify-center items-center rounded-[8px] cursor-pointer shadow-2xl leading-none font-semibold
                  ${isActive ? 'bg-layout-color text-white' : 'text-[#94979C] hover:bg-layout-color hover:text-white'}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex-1 h-full overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
