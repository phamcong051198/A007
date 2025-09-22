import React from 'react'
import { useEffect, useState } from 'react'

import SettingCheckBox from '@renderer/components/BetListContraListSuccessList/SettingCheckBox'
import { SettingTableViewType, TicketInfoDataBetType } from '@shared/common/types'
import { ROW_SIZE } from '@shared/common/constants'
import TableData from '@renderer/components/BetListContraListSuccessList/TableData'
import { addEmptyRows } from '@renderer/lib/addEmptyRows'
import DownloadCloudIcon from '@renderer/icons/download-cloud-icon'
import { handleSaveReport } from '@renderer/lib/handleSaveReport'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

const ListEventWaitingList = () => {
  const [settings, setSettings] = useState({ clearWhenOver100: 0, enableScroll: 0 })
  const [dataTable, setDataTable] = useState<TicketInfoDataBetType[]>([])

  const handleCheckboxChange = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: Number(checked) }))
  }

  useEffect(() => {
    const fetchSettings = async () => {
      const response: SettingTableViewType = await window.electron.ipcRenderer.invoke(
        'SettingViewTable',
        {
          tab: 'WaitingList'
        }
      )
      setSettings({ clearWhenOver100: response.clear, enableScroll: response.scroll })
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetWaitingList')
      setDataTable(addEmptyRows(data))
    }
    const intervalId = setInterval(fetchData, 500)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.send('UpdateSettingViewTable', {
      tab: 'WaitingList',
      data: {
        clear: settings.clearWhenOver100,
        scroll: settings.enableScroll
      }
    })
  }, [settings])

  const handleSave = () => {
    handleSaveReport('WaitingListReport', dataTable)
  }
  return (
    <div className="h-full px-1 flex flex-col text-sm">
      <div className="flex justify-between items-center min-w-[968px] border border-border-default h-[40px] px-[24px] mb-9 rounded-[12px] ">
        <div className="flex gap-5">
          <SettingCheckBox settings={settings} handleCheckboxChange={handleCheckboxChange} />
          <div className="flex gap-1 mr-5">
            <p>Total</p>
            <p>{dataTable.length / ROW_SIZE}</p>
          </div>
        </div>
        <div
          className={`${isBSoft ? 'bg-blue-color' : 'bg-purple-color'} "flex items-center justify-center cursor-pointer rounded-lg text-white "`}
          onClick={handleSave}
        >
          <div className="w-[126px] flex items-center justify-center py-[5px]">
            <DownloadCloudIcon />
            <p className="font-semibold ml-1">Save Report </p>
          </div>
        </div>
      </div>
      <TableData dataTable={dataTable} enableScroll={settings.enableScroll} />
    </div>
  )
}

export default React.memo(ListEventWaitingList)
