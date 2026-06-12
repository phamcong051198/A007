import React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  ColumnResizeDirection,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  RowData,
  useReactTable
} from '@tanstack/react-table'
import clsx from 'clsx'

import { defaultColumns } from '@renderer/components/BetListContraListSuccessList/defaultColumns'

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
    columnResizeDirection,
    columnResizeMode,
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      setHasError: (hasError: boolean) => {
        console.error('An error occurred:', hasError)
      },
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
      }
    }
  })

  const handleRowClick = (rowId) => {
    setSelectedRowId(rowId)
  }

  return (
    <div
      className="text-xs flex-1 flex flex-col min-w-[968px] border border-border-default overflow-y-auto custom-scrollbar bg-white"
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
                      maxWidth: header.getSize(),
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: header.getSize()
                    }}
                    className="sticky top-[-1px] z-10 truncate border border-border-default text-start pl-1 text-sm bg-white"
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
                    'hover:bg-blue-200 font-medium',
                    isBetSuccess ? 'bg-blue-100' : 'bg-white',
                    selectedRowId === row.id && 'bg-blue-200'
                  )}
                  onClick={() => handleRowClick(row.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        maxWidth: cell.column.getSize(),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: cell.column.getSize()
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
