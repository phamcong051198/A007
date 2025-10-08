import React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  useReactTable,
  ColumnResizeMode,
  getCoreRowModel,
  flexRender,
  ColumnResizeDirection,
  RowData
} from '@tanstack/react-table'

import { defaultColumns } from '@renderer/components/BetListContraListSuccessList/defaultColumns'
import clsx from 'clsx'
import { TicketInfoDataBetType } from '@shared/common/types'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
    setHasError: (hasError: boolean) => void
  }
}

const TableData = ({ dataTable, enableScroll }) => {
  const [data, setData] = useState<TicketInfoDataBetType[]>(dataTable)
  const [columns] = useState<typeof defaultColumns>(() => [...defaultColumns])
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const [columnResizeDirection] = useState<ColumnResizeDirection>('ltr')

  const [selectedRowId, setSelectedRowId] = useState(null)

  const tableContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setData(dataTable)
  }, [dataTable])

  useEffect(() => {
    if (enableScroll && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight
    }
  }, [data, enableScroll])

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    columnResizeDirection,
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

  const handleRowClick = (rowId) => {
    setSelectedRowId(rowId)
  }

  return (
    <div
      className=" flex-1 flex flex-col min-w-[968px] border border-border-default overflow-y-auto custom-scrollbar"
      ref={tableContainerRef}
      style={{ direction: table.options.columnResizeDirection }}
    >
      <div className="h-[100px]">
        <table style={{ width: table.getCenterTotalSize() }} className="border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                      maxWidth: header.getSize(),
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    className="sticky top-[-1px] z-10 truncate border border-border-default text-start pl-1 text-sm bg-bg-gray"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    <div
                      onDoubleClick={() => header.column.resetSize()}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`resizer ${table.options.columnResizeDirection} ${
                        header.column.getIsResizing() ? 'isResizing' : ''
                      }`}
                      style={{
                        transform:
                          columnResizeMode === 'onEnd' && header.column.getIsResizing()
                            ? `translateX(${
                                (table.options.columnResizeDirection === 'rtl' ? -1 : 1) *
                                (table.getState().columnSizingInfo.deltaOffset ?? 0)
                              }px)`
                            : ''
                      }}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const info = row.original.info as string
              const isBetSuccess = info?.includes('Bet Success')

              return (
                <tr
                  key={row.id}
                  className={clsx(
                    'hover:bg-layout-color',
                    selectedRowId === row.id ? 'bg-blue-200' : '',
                    isBetSuccess ? 'bg-black text-white font-medium' : 'bg-bg-gray'
                  )}
                  onClick={() => handleRowClick(row.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      className="shadow-none"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default React.memo(TableData)
