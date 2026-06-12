import React, { useCallback } from 'react'
import { useEffect, useState } from 'react'

import SettingCheckBox from '@renderer/components/BetListContraListSuccessList/SettingCheckBox'
import TableData from '@renderer/components/BetListContraListSuccessList/TableData'
import TotalTicket from '@renderer/components/BetListContraListSuccessList/TotalTicket'
import { useCount } from '@renderer/context/CountContext'
import { addEmptyRows } from '@renderer/lib/addEmptyRows'
import { handleSaveReport } from '@renderer/lib/handleSaveReport'
import DownloadCloudIcon from '@renderer/icons/download-cloud-icon'

import { newDataTableEmpty, ROW_SIZE } from '@shared/common/constants'
import {
  SettingTableViewType,
  TicketInfoDataBetType,
  WaitingSuccessContraDBType
} from '@shared/common/types'

const ListEventSuccessList = () => {
  const [settings, setSettings] = useState({ clearWhenOver100: 0, enableScroll: 0 })
  const [dataTable, setDataTable] = useState<TicketInfoDataBetType[]>([])
  const { totalSuccessList } = useCount()

  const handleCheckboxChange = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: Number(checked) }))
  }

  const handleListData = useCallback(
    (_: unknown, newData: WaitingSuccessContraDBType) => {
      const dataEvent = JSON.parse(newData.dataPair)
      const maxLength = settings.clearWhenOver100 ? 100 : 500

      setDataTable((prev) =>
        prev.length / ROW_SIZE >= maxLength
          ? [...dataEvent, newDataTableEmpty]
          : [...dataEvent, newDataTableEmpty, ...prev]
      )
    },
    [settings.clearWhenOver100]
  )

  useEffect(() => {
    const fetchSettings = async () => {
      const response: SettingTableViewType = await window.electron.ipcRenderer.invoke(
        'SettingViewTable',
        {
          tab: 'SuccessList'
        }
      )
      setSettings({ clearWhenOver100: response.clear, enableScroll: response.scroll })
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const fetchBetList = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetSuccessList')
      setDataTable(addEmptyRows(data))
    }

    fetchBetList()
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.on('DataSuccessList', handleListData)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('DataSuccessList')
    }
  }, [handleListData])

  useEffect(() => {
    window.electron.ipcRenderer.send('UpdateSettingViewTable', {
      data: {
        clear: settings.clearWhenOver100,
        scroll: settings.enableScroll
      },
      tab: 'SuccessList'
    })
  }, [settings])

  const handleSave = () => {
    handleSaveReport('SuccessListReport', dataTable)
  }

  return (
    <div className="h-full px-1 flex flex-col text-sm">
      <div className="flex justify-between items-center min-w-[968px] border bg-white border-border-default h-[40px] px-[6px] mb-[12px] rounded-[12px] ">
        <div className="flex gap-5">
          <SettingCheckBox settings={settings} handleCheckboxChange={handleCheckboxChange} />
          <div className="flex gap-1 mr-5">
            <p>Total</p>
            <p>{dataTable.length / ROW_SIZE}</p>
            <TotalTicket totalTickets={totalSuccessList} />
          </div>
        </div>
        <div
          className={`${'bg-blue-color'} "flex items-center justify-center cursor-pointer rounded-lg text-white "`}
          onClick={handleSave}
        >
          <div className="w-[126px] flex items-center justify-center py-[5px]">
            <DownloadCloudIcon />
            <p className="font-semibold text-sm ml-1">Save Report </p>
          </div>
        </div>
      </div>

      <TableData dataTable={dataTable} enableScroll={settings.enableScroll} />
    </div>
  )
}

export default React.memo(ListEventSuccessList)
