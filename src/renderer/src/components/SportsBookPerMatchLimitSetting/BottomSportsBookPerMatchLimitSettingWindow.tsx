/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect } from 'react'
import { useRef, useState } from 'react'
import { Checkbox } from '@renderer/components/ui/checkbox'
import {
  useReactTable,
  ColumnResizeMode,
  getCoreRowModel,
  flexRender,
  ColumnResizeDirection,
  RowData
} from '@tanstack/react-table'
import { PerMatchLimitSettingContext } from '@renderer/context/PerMatchLimitSettingContext'
import { defaultColumns } from '@renderer/components/SportsBookPerMatchLimitSetting/defaultColumns'
import { handleSaveReportPerMatchLimit } from '@renderer/lib/handleSaveReportPerMatchLimit'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
    setHasError: (hasError: boolean) => void
  }
}

const BottomSportsBookPerMatchLimitSettingWindow = () => {
  const context = useContext(PerMatchLimitSettingContext)
  if (!context) return null

  const { selectedPlatform } = context

  const [data, setData] = useState<any[]>([])

  const [columns] = useState<typeof defaultColumns>(() => [...defaultColumns])
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const [columnResizeDirection] = useState<ColumnResizeDirection>('ltr')

  const [isScrollChecked, setIsScrollChecked] = useState(() => {
    const storedValue = sessionStorage.getItem('isScrollChecked_BetList')
    return storedValue !== null ? JSON.parse(storedValue) : true
  })

  useEffect(() => {
    if (selectedPlatform?.namePlatform === 'Per-Match Details') return

    let interval: NodeJS.Timeout | null = null
    let isMounted = true
    const fetchData = async () => {
      try {
        const data = await window.electron.ipcRenderer.invoke(
          'PerMatchLimitDetailPlatform',
          selectedPlatform.namePlatform
        )

        if (isMounted) {
          setData(data)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching data:', error)
        }
      }
    }

    fetchData()

    interval = setInterval(fetchData, 1000)

    return () => {
      isMounted = false
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }
  }, [selectedPlatform])

  const tableContainerRef = useRef<HTMLDivElement | null>(null)

  const handleScrollChange = (value: boolean) => {
    setIsScrollChecked(value)
    sessionStorage.setItem('isScrollChecked_BetList', JSON.stringify(value))
  }

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    columnResizeDirection,
    defaultColumn: {
      minSize: 0
    },
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...row,
                [columnId]: value
              }
            }
            return row
          })
        )
      },
      setHasError: (hasError: boolean) => {
        console.error('An error occurred:', hasError)
      }
    }
  })

  const handleSaveReport = () => {
    handleSaveReportPerMatchLimit(data)
  }

  return (
    <div className="flex-1 px-2 flex flex-col ">
      <div className="flex justify-between gap-2">
        <p className="text-base font-bold text-[#0000FF]">{selectedPlatform.namePlatform}</p>
        <div className="flex">
          <div className="flex items-center mr-1 mb-1 cursor-pointer">
            <Checkbox
              id={'scroll'}
              checked={isScrollChecked}
              onCheckedChange={handleScrollChange}
              className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-zinc-900 mr-2 cursor-pointer"
            />
            <label htmlFor="scroll">Scroll</label>
          </div>
          <p
            className="underline text-blue-600 text-sm p-1 cursor-pointer mx-2 hover:text-blue-800"
            onClick={handleSaveReport}
          >
            Save Report
          </p>
          <div className=" flex  gap-1  ">
            <p>Total</p>
            <p>{data.length}</p>
          </div>
        </div>
      </div>

      <div className=" flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden ">
          <div className=" h-full w-full border border-zinc-500 overflow-hidden">
            <div
              ref={tableContainerRef}
              style={{ direction: table.options.columnResizeDirection }}
              className="h-full w-full overflow-auto custom-scrollbar"
            >
              <table
                {...{
                  style: {
                    width: table.getCenterTotalSize()
                  }
                }}
                className="bg-[#f8f6f6] custom-table-list"
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          {...{
                            colSpan: header.colSpan,
                            style: {
                              paddingLeft: '5px',
                              width: header.getSize(),
                              maxWidth: header.getSize(),
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }
                          }}
                          className="sticky top-[-1px] z-10 "
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          <div
                            {...{
                              onDoubleClick: () => header.column.resetSize(),
                              onMouseDown: header.getResizeHandler(),
                              onTouchStart: header.getResizeHandler(),
                              className: `resizer ${table.options.columnResizeDirection} ${
                                header.column.getIsResizing() ? 'isResizing' : ''
                              }`,
                              style: {
                                transform:
                                  columnResizeMode === 'onEnd' && header.column.getIsResizing()
                                    ? `translateX(${
                                        (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
                                        (table.getState().columnSizingInfo.deltaOffset ?? 0)
                                      }px)`
                                    : ''
                              }
                            }}
                          />
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-blue-300 ${Math.floor(index / 2) % 2 === 0 ? 'bg-white' : 'bg-gray-200'}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            width: cell.column.getSize(),
                            maxWidth: cell.column.getSize(),
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            paddingLeft: '4px'
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(BottomSportsBookPerMatchLimitSettingWindow)
