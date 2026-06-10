import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ColumnResizeMode, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { createColumnsAccountList } from '@renderer/components/AccountList/defaultColumnsAccountList'

import { AccountType } from '@shared/common/types'

const cellKey = (rowIndex: number, columnId: string) => `${rowIndex}-${columnId}`
interface CellPosition {
  rowIndex: number
  columnId: string
}

export const Main = ({ setOpenModalSetting, sportsBook }) => {
  const { id: sportsBookId } = useParams()

  const [data, setData] = useState<AccountType[]>([])
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 })

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    setData((prev) => {
      const updated = [...prev]
      ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]

      const temp = updated[index].orderNumber
      updated[index].orderNumber = updated[index - 1].orderNumber
      updated[index - 1].orderNumber = temp

      return [...updated]
    })
  }

  const handleMoveDown = (index: number) => {
    setData((prev) => {
      if (index >= prev.length - 1) return prev

      const updated = [...prev]

      ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]

      const temp = updated[index].orderNumber
      updated[index].orderNumber = updated[index + 1].orderNumber
      updated[index + 1].orderNumber = temp

      return updated
    })
  }

  const [columns] = useState(() =>
    createColumnsAccountList({
      onMoveDown: handleMoveDown,
      onMoveUp: handleMoveUp
    })
  )
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [dragStart, setDragStart] = useState<CellPosition | null>(null)
  const [lastSelected, setLastSelected] = useState<CellPosition | null>(null)
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [loginIDErrors, setLoginIDErrors] = useState<Record<number, string>>({})

  const isDraggingRef = useRef(false)

  const handleRightClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleCloseMenu = () => {
    setContextMenu({ ...contextMenu, visible: false })
  }

  useEffect(() => {
    const fetch = async () => {
      const listAccountByPlatform = await window.electron.ipcRenderer.invoke(
        'GetListAccountByPlatform',
        sportsBook.platform
      )

      setData(listAccountByPlatform)

      if (listAccountByPlatform.length > 0) {
        const firstColumnId = table.getAllLeafColumns()[0]?.id || 'no'

        handleSelection(0, firstColumnId, {
          nativeEvent: new MouseEvent('mousedown', { bubbles: true }),
          persist: () => {},
          preventDefault: () => {},
          stopPropagation: () => {}
        } as unknown as React.MouseEvent)
      }
    }
    fetch()
  }, [])

  const checkDuplicateLoginID = (value: string, rowIndex: number) => {
    if (!value.trim()) return false
    return data.some((row, idx) => idx !== rowIndex && row.loginID === value)
  }

  const table = useReactTable({
    columnResizeMode,
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      setHasError: () => {},
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
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

  const handleSelection = (rowIndex: number, columnId: string, event: React.MouseEvent) => {
    const key = cellKey(rowIndex, columnId)
    const columnIds = table.getAllLeafColumns().map((col) => col.id)

    if (event.ctrlKey || event.metaKey) {
      setSelection((prev) => {
        const newSet = new Set(prev)
        newSet.has(key) ? newSet.delete(key) : newSet.add(key)
        return newSet
      })
      setLastSelected({ columnId, rowIndex })
    } else if (event.shiftKey && lastSelected) {
      selectRange(rowIndex, columnId, columnIds)
    } else {
      setSelection(new Set([key]))
      setLastSelected({ columnId, rowIndex })
    }
  }

  const selectRange = (rowIndex: number, columnId: string, columnIds: string[]) => {
    if (!lastSelected) return

    const startRow = Math.min(lastSelected.rowIndex, rowIndex)
    const endRow = Math.max(lastSelected.rowIndex, rowIndex)
    const startColIndex = columnIds.indexOf(lastSelected.columnId)
    const endColIndex = columnIds.indexOf(columnId)

    const newSet = new Set<string>()
    for (let r = startRow; r <= endRow; r++) {
      for (
        let c = Math.min(startColIndex, endColIndex);
        c <= Math.max(startColIndex, endColIndex);
        c++
      ) {
        newSet.add(cellKey(r, columnIds[c]))
      }
    }
    setSelection(newSet)
  }

  const handleMouseDown = (rowIndex: number, columnId: string, event: React.MouseEvent) => {
    if (event.button !== 0 || columnId === 'actions') return

    handleSelection(rowIndex, columnId, event)
    setDragStart({ columnId, rowIndex })
    isDraggingRef.current = true
  }

  const handleMouseEnter = (rowIndex: number, columnId: string) => {
    if (!isDraggingRef.current || !dragStart || columnId === 'actions') return

    const columnIds = table.getAllLeafColumns().map((col) => col.id)
    const startRow = Math.min(dragStart.rowIndex, rowIndex)
    const endRow = Math.max(dragStart.rowIndex, rowIndex)
    const startColIndex = columnIds.indexOf(dragStart.columnId)
    const endColIndex = columnIds.indexOf(columnId)

    const newSelection = new Set<string>()
    for (let r = startRow; r <= endRow; r++) {
      for (
        let c = Math.min(startColIndex, endColIndex);
        c <= Math.max(startColIndex, endColIndex);
        c++
      ) {
        newSelection.add(cellKey(r, columnIds[c]))
      }
    }
    setSelection(newSelection)
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    setDragStart(null)
  }

  const handleCopy = (e: ClipboardEvent) => {
    const rows = table.getRowModel().rows
    const colIds = table.getAllLeafColumns().map((col) => col.id)
    const selected: string[][] = rows.map((_, r) =>
      colIds.map((colId) =>
        selection.has(cellKey(r, colId))
          ? colId === 'no'
            ? String(r + 1)
            : String(rows[r].getValue(colId))
          : ''
      )
    )

    const cleanedText = selected
      .map((row) =>
        row
          .map((cell) => cell.trim())
          .join('\t')
          .trim()
      )
      .join('\n')
      .trim()

    navigator.clipboard
      .writeText(cleanedText)
      .then(() => {
        console.log('Copied to clipboard successfully!')
      })
      .catch((err) => {
        console.error('Failed to copy to clipboard: ', err)
      })

    e.preventDefault()
  }

  const handlePaste = (e: ClipboardEvent) => {
    if (document.activeElement?.tagName === 'INPUT') {
      return
    }

    const clipboardData = e.clipboardData?.getData('text/plain')
    if (!clipboardData || selection.size === 0) return

    const rows = clipboardData
      .trim()
      .split(/\r?\n/)
      .map((row) => row.trim().split(/\s+/))
    if (rows.length === 0) return

    const selected = Array.from(selection).map((key) => {
      const [rowIndex, colId] = key.split('-')
      return { colId, rowIndex: parseInt(rowIndex) }
    })

    const columnIds = table.getAllLeafColumns().map((col) => col.id)
    const minRow = Math.min(...selected.map((s) => s.rowIndex))
    const minColIndex = Math.min(...selected.map((s) => columnIds.indexOf(s.colId)))
    const validProxyScopes = ['OnlyLogin', 'Full', 'None']

    setData((prev) => {
      const updated = [...prev]

      for (let r = 0; r < rows.length; r++) {
        const dataRow = rows[r]
        for (let c = 0; c < dataRow.length; c++) {
          const targetRow = minRow + r
          const targetColIndex = minColIndex + c
          const targetColId = columnIds[targetColIndex]

          if (targetRow < updated.length && targetColId && targetColId !== 'no') {
            let value = dataRow[c]?.trim()

            if (targetColId === 'proxyScope') {
              if (!validProxyScopes.includes(value)) {
                value = 'None'
              }
            }

            updated[targetRow] = {
              ...updated[targetRow],
              [targetColId]: value
            }
          }
        }
      }
      return updated
    })
    // Reset selection to the pasted area
    const newSelection = new Set<string>()
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[0].length; c++) {
        const targetRow = minRow + r
        const targetColIndex = minColIndex + c
        const targetColId = columnIds[targetColIndex]
        if (targetColId && targetColId !== 'no') {
          newSelection.add(cellKey(targetRow, targetColId))
        }
      }
    }
    setSelection(newSelection)

    e.preventDefault()
  }

  const handleCut = (e: KeyboardEvent) => {
    if (!((e.ctrlKey || e.metaKey) && e.key === 'x') || selection.size === 0) return

    e.preventDefault()
    const rows = table.getRowModel().rows
    const colIds = table.getAllLeafColumns().map((col) => col.id)

    const selectedByRow: Record<number, Record<string, boolean>> = {}
    let isNoSelected = false

    for (const key of selection) {
      const [rowIndex, colId] = key.split('-')
      const rIdx = parseInt(rowIndex)
      selectedByRow[rIdx] = selectedByRow[rIdx] || {}
      selectedByRow[rIdx][colId] = true
      if (colId === 'no') isNoSelected = true
    }

    const clipboardLines: string[] = []
    const newData = [...data]

    for (const rowIndexStr in selectedByRow) {
      const rowIndex = parseInt(rowIndexStr)
      const selectedCols = selectedByRow[rowIndex]
      const row = rows[rowIndex]
      const line: string[] = []

      for (const colId of colIds) {
        if (colId === 'no') {
          line.push(isNoSelected && selectedCols[colId] ? String(rowIndex + 1).trim() : '')
        } else if (selectedCols[colId]) {
          const val = row.getValue(colId) ?? ''
          line.push(String(val).trim())
          newData[rowIndex] = { ...newData[rowIndex], [colId]: '' }
        } else {
          line.push('')
        }
      }
      clipboardLines.push(line.join('\t').trim())
    }

    navigator.clipboard.writeText(clipboardLines.join('\n'))
    setData(newData)
  }

  const handleSelectAll = (e: KeyboardEvent) => {
    if (!((e.ctrlKey || e.metaKey) && e.key === 'a')) return

    e.preventDefault()
    const allCellKeys = new Set<string>()
    const columnIds = table.getAllLeafColumns().map((col) => col.id)

    table.getRowModel().rows.forEach((_, rowIndex) => {
      columnIds.forEach((colId) => allCellKeys.add(cellKey(rowIndex, colId)))
    })

    setSelection(allCellKeys)
  }

  const handleClear = () => {
    if (selection.size === 0) return

    const selectedByRow: Record<number, Record<string, boolean>> = {}

    for (const key of selection) {
      const [rowIndex, colId] = key.split('-')
      const rIdx = parseInt(rowIndex)
      selectedByRow[rIdx] = selectedByRow[rIdx] || {}
      selectedByRow[rIdx][colId] = true
    }

    setData((prev) => {
      const updated = [...prev]

      for (const rowIndexStr in selectedByRow) {
        const rowIndex = parseInt(rowIndexStr)
        const selectedCols = selectedByRow[rowIndex]

        updated[rowIndex] = {
          ...updated[rowIndex],
          ...Object.fromEntries(
            Object.keys(selectedCols)
              .filter((colId) => colId !== 'no' && colId !== 'actions')
              .map((colId) => [colId, ''])
          )
        }
      }

      return updated
    })

    setSelection(new Set())
  }

  const startEditing = (rowIndex: number, columnId: string) => {
    if (columnId === 'no' || columnId === 'actions') return
    setEditingCell({ columnId, rowIndex })
    setEditingValue(String(data[rowIndex][columnId as keyof AccountType] ?? ''))

    setLoginIDErrors({})
  }

  const saveEditing = () => {
    if (!editingCell) return
    const { rowIndex, columnId } = editingCell

    setData((prev) => {
      const updated = [...prev]
      updated[rowIndex] = { ...updated[rowIndex], [columnId]: editingValue }
      return updated
    })

    setEditingCell(null)
    setEditingValue('')
  }

  const cancelEditing = () => {
    setEditingCell(null)
    setEditingValue('')
  }

  useEffect(() => {
    window.addEventListener('copy', handleCopy)
    window.addEventListener('paste', handlePaste)
    window.addEventListener('keydown', handleCut)
    window.addEventListener('keydown', handleSelectAll)
    return () => {
      window.removeEventListener('copy', handleCopy)
      window.removeEventListener('paste', handlePaste)
      window.removeEventListener('keydown', handleCut)
      window.removeEventListener('keydown', handleSelectAll)
    }
  }, [selection, table, data])

  const handleSaveAccountList = () => {
    const newErrors: Record<number, string> = {}
    data.forEach((row, index) => {
      if (checkDuplicateLoginID(row.loginID ?? '', index)) {
        newErrors[index] = 'This account already exists!'
      }
    })
    if (Object.keys(newErrors).length) {
      setLoginIDErrors(newErrors)
      return
    }

    const dataAccountNew = table.getCoreRowModel().rows.map((row) => {
      const original = row.original
      const trimmedOriginal = Object.fromEntries(
        Object.entries(original).map(([key, value]) =>
          typeof value === 'string' ? [key, value.trim()] : [key, value]
        )
      )

      // validate proxyScope
      const validScopes = ['OnlyLogin', 'Full', 'None']
      if (!validScopes.includes(trimmedOriginal.proxyScope)) {
        trimmedOriginal.proxyScope = 'None'
      }

      // validate customIP
      const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
      if (!ipRegex.test(trimmedOriginal.customIP)) {
        trimmedOriginal.customIP = ''
      }

      return trimmedOriginal
    })

    window.electron.ipcRenderer.send('SaveAccountListWindow', { dataAccountNew, sportsBookId })
    setOpenModalSetting(false)
  }

  return (
    <div className="h-full py-[16px]" onClick={handleCloseMenu}>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden pt-2">
          <div
            className="h-full w-full border border-border-default bg-white overflow-hidden"
            onContextMenu={handleRightClick}
          >
            <div
              onMouseUp={handleMouseUp}
              style={{ direction: table.options.columnResizeDirection }}
              className="h-full w-full overflow-auto custom-scrollbar"
            >
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
                  {table.getRowModel().rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const key = cellKey(rowIndex, cell.column.id)
                        const isSelected = selection.has(key)
                        const isEditing =
                          editingCell?.rowIndex === rowIndex &&
                          editingCell?.columnId === cell.column.id

                        return (
                          <td
                            key={cell.id}
                            style={{
                              maxWidth: cell.column.getSize(),
                              width: cell.column.getSize()
                            }}
                            className={`border border-border-default p-0 h-3 truncate cursor-pointer text-sm ${
                              isSelected ? 'bg-blue-200' : ''
                            }`}
                            onMouseDown={(e) => handleMouseDown(rowIndex, cell.column.id, e)}
                            onMouseEnter={() => handleMouseEnter(rowIndex, cell.column.id)}
                            onDoubleClick={() => startEditing(rowIndex, cell.column.id)}
                          >
                            <div className="relative">
                              {isEditing && cell.column.id !== 'proxyScope' ? (
                                <input
                                  autoFocus
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onPaste={(e) => {
                                    const pastedValue = e.clipboardData.getData('text/plain')
                                    setEditingValue(pastedValue)
                                    e.preventDefault()
                                  }}
                                  onBlur={saveEditing}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditing()
                                    if (e.key === 'Escape') cancelEditing()
                                  }}
                                  className="w-full px-1"
                                />
                              ) : (
                                <div className={cell.column.id !== 'proxyScope' ? 'px-1' : ''}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                              )}
                              {cell.column.id === 'loginID' && loginIDErrors[rowIndex] && (
                                <div className="text-red-500 text-xs mt-1 px-1">
                                  {loginIDErrors[rowIndex]}
                                </div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {contextMenu.visible && (
              <div
                className="absolute z-[1000] w-32 bg-white text-sm"
                style={{
                  left: contextMenu.x - 4,
                  top: contextMenu.y - 90,
                  transform: 'translate(-7px, -18px)'
                }}
              >
                <div
                  className="pl-8 cursor-pointer border hover:bg-hover-default "
                  onClick={() =>
                    handleCut(new KeyboardEvent('keydown', { ctrlKey: true, key: 'x' }))
                  }
                >
                  Cut
                </div>
                <div
                  className="pl-8 cursor-pointer border border-t-0 border-b-0 hover:bg-hover-default"
                  onClick={(e) => {
                    e.preventDefault()
                    const clipboardEvent = new ClipboardEvent('copy', {
                      clipboardData: new DataTransfer()
                    })
                    handleCopy(clipboardEvent)
                  }}
                >
                  Copy
                </div>
                <div
                  className="pl-8 cursor-pointer border hover:bg-hover-default"
                  onClick={async (e) => {
                    e.preventDefault()
                    const clipboardText = await navigator.clipboard.readText()

                    const clipboardEvent = new ClipboardEvent('paste', {
                      clipboardData: new DataTransfer()
                    })
                    clipboardEvent.clipboardData?.setData('text/plain', clipboardText)
                    handlePaste(clipboardEvent)
                  }}
                >
                  Paste
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-[16px] mt-[24px] justify-between">
          <button
            className="w-[80px] outline-none border border-border-default hover:border-gray-700  h-[40px] font-semibold rounded-[8px]"
            onClick={handleClear}
          >
            Clear
          </button>
          <div>
            <button
              className="w-[80px] mr-[16px] outline-none border border-border-default hover:border-gray-700  h-[40px] font-semibold rounded-[8px]"
              onClick={() => setOpenModalSetting(false)}
            >
              Cancel
            </button>
            <button
              className={`${'bg-blue-color'} text-white w-[80px] border-none  h-[40px] font-semibold  hover:bg-opacity-90 rounded-[8px]`}
              onClick={handleSaveAccountList}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
