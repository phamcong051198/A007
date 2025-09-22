import React, { useCallback } from 'react'
import { useEffect, useState } from 'react'

import ContraStrategy from '@renderer/components/Common/ContraStrategy'
import SettingCheckBox from '@renderer/components/BetListContraListSuccessList/SettingCheckBox'
import TotalTicket from '@renderer/components/BetListContraListSuccessList/TotalTicket'
import {
  SettingTableViewType,
  TicketInfoDataBetType,
  WaitingSuccessContraDBType
} from '@shared/common/types'
import TableData from '@renderer/components/BetListContraListSuccessList/TableData'
import { addEmptyRows } from '@renderer/lib/addEmptyRows'
import { newDataTableEmpty, ROW_SIZE } from '@shared/common/constants'
import { handleSaveReport } from '@renderer/lib/handleSaveReport'
import DownloadCloudIcon from '@renderer/icons/download-cloud-icon'
import { useCount } from '@renderer/context/CountContext'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

const ListEventContraList = () => {
  const [strategy, setStrategy] = useState('')

  const [settings, setSettings] = useState({ clearWhenOver100: 0, enableScroll: 0 })
  const [dataTable, setDataTable] = useState<TicketInfoDataBetType[]>([])
  const { totalContraList } = useCount()

  const handleChangeStrategy = (value: string) => {
    setStrategy(value as 'auto' | 'manual')
  }

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
          : [...prev, ...dataEvent, newDataTableEmpty]
      )
    },
    [settings.clearWhenOver100]
  )

  useEffect(() => {
    const fetchSettings = async () => {
      const response: SettingTableViewType = await window.electron.ipcRenderer.invoke(
        'SettingViewTable',
        {
          tab: 'ContraList'
        }
      )
      setStrategy(response.contraStrategy)
      setSettings({ clearWhenOver100: response.clear, enableScroll: response.scroll })
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    const fetchBetList = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetContraList')
      setDataTable(addEmptyRows(data))
    }

    fetchBetList()
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.on('DataContraList', handleListData)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('DataContraList')
    }
  }, [handleListData])

  useEffect(() => {
    window.electron.ipcRenderer.send('UpdateSettingViewTable', {
      tab: 'ContraList',
      data: {
        contraStrategy: strategy,
        clear: settings.clearWhenOver100,
        scroll: settings.enableScroll
      }
    })
  }, [strategy, settings])

  const handleSave = () => {
    handleSaveReport('ContraListReport', dataTable)
  }

  return (
    <div className="h-full px-1 flex flex-col text-sm">
      <div className="flex justify-between items-center min-w-[968px] border border-border-default h-[40px] px-[24px] mb-9 rounded-[12px] ">
        <ContraStrategy strategy={strategy} handleChangeStrategy={handleChangeStrategy} />
        <div className="flex gap-5">
          <SettingCheckBox settings={settings} handleCheckboxChange={handleCheckboxChange} />

          <div className="flex gap-1 items-center mr-5">
            <p>Total</p>
            <p>{dataTable.length / ROW_SIZE}</p>
            <TotalTicket totalTickets={totalContraList} />
          </div>
        </div>
        <div
          className={`${isBSoft ? 'bg-blue-color' : 'bg-purple-color'} "flex items-center justify-center cursor-pointer rounded-lg text-white "`}
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

export default React.memo(ListEventContraList)
