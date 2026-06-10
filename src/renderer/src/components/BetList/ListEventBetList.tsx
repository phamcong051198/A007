import React, { useCallback, useEffect, useState } from 'react'

import SettingCheckBox from '@renderer/components/BetListContraListSuccessList/SettingCheckBox'
import TableData from '@renderer/components/BetListContraListSuccessList/TableData'
import TotalTicket from '@renderer/components/BetListContraListSuccessList/TotalTicket'
import ContraStrategy from '@renderer/components/Common/ContraStrategy'
import { useCount } from '@renderer/context/CountContext'
import { addEmptyRows } from '@renderer/lib/addEmptyRows'
import { handleSaveReport } from '@renderer/lib/handleSaveReport'
import DownloadCloudIcon from '@renderer/icons/download-cloud-icon'

import { newDataTableEmpty, ROW_SIZE } from '@shared/common/constants'
import { BetListDBType, SettingTableViewType, TicketInfoDataBetType } from '@shared/common/types'

const ListEventBetList = () => {
  const [strategy, setStrategy] = useState('')

  const [settings, setSettings] = useState({ clearWhenOver100: 0, enableScroll: 0 })
  const [dataTable, setDataTable] = useState<TicketInfoDataBetType[]>([])
  const { totalBetList } = useCount()

  const handleChangeStrategy = (value: string) => {
    setStrategy(value as 'auto' | 'manual')
  }

  const handleCheckboxChange = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: Number(checked) }))
  }

  const handleListData = useCallback(
    (_: unknown, newData: BetListDBType) => {
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
        { tab: 'BetList' }
      )
      setStrategy(response.contraStrategy)
      setSettings({ clearWhenOver100: response.clear, enableScroll: response.scroll })
    }

    fetchSettings()
  }, [])

  useEffect(() => {
    const fetchBetList = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetBetListResult')
      setDataTable(addEmptyRows(data))
    }

    fetchBetList()
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.on('DataBetList', handleListData)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('DataBetList')
    }
  }, [handleListData])

  useEffect(() => {
    window.electron.ipcRenderer.send('UpdateSettingViewTable', {
      data: {
        clear: settings.clearWhenOver100,
        contraStrategy: strategy,
        scroll: settings.enableScroll
      },
      tab: 'BetList'
    })
  }, [strategy, settings])

  const handleSave = () => {
    handleSaveReport('BetListReport', dataTable)
  }
  return (
    <div className="h-full px-1 flex flex-col text-sm">
      <div className="flex justify-between bg-white items-center min-w-[968px] border border-border-default h-[40px] px-[24px] mb-9 rounded-[12px] ">
        <ContraStrategy strategy={strategy} handleChangeStrategy={handleChangeStrategy} />
        <div className="flex gap-5">
          <SettingCheckBox settings={settings} handleCheckboxChange={handleCheckboxChange} />

          <div className="flex gap-1 items-center mr-5">
            <p>Total:</p>
            <p>{dataTable.length / ROW_SIZE}</p>
            <TotalTicket totalTickets={totalBetList} />
          </div>
        </div>
        <div
          className={`${'bg-blue-color'} "flex items-center justify-center cursor-pointer rounded-lg text-white "`}
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

export default React.memo(ListEventBetList)
