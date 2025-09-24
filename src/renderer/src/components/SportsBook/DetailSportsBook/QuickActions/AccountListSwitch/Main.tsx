import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  ColumnDef,
  ColumnResizeDirection,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  RowData,
  useReactTable
} from '@tanstack/react-table'

import ClearAccountsDialog from '@renderer/components/ClearAccountsDialog'
import { NotificationError } from '@renderer/components/NotificationPopup/NotificationError'
import { Button } from '@renderer/components/ui/button'
import InformationCircle from '@renderer/icons/information-circle'
import { findDuplicateLoginIDs } from '@renderer/lib/findDuplicateLoginIDs'
import { AccountSwitchType, AccountType } from '@shared/common/types'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
    setHasError: (hasError: boolean) => void
    setData?: React.Dispatch<React.SetStateAction<TData[]>>
  }
}

const defaultColumns: ColumnDef<AccountSwitchType>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: () => <span>No</span>,
    footer: (props) => props.column.id,
    cell: ({ row }) => {
      return (
        <div className="px-1 w-full outline-none rounded-none flex items-center justify-center leading-none">
          {row.index + 1}
        </div>
      )
    },
    size: 30
  },
  {
    id: 'loginID',
    accessorKey: 'loginID',
    header: () => <span>Login ID</span>,
    footer: (props) => props.column.id,
    size: 150
  },
  {
    id: 'password',
    accessorKey: 'password',
    header: () => <span>Password</span>,
    footer: (props) => props.column.id,
    size: 140
  },
  {
    id: 'loginURL',
    accessorKey: 'loginURL',
    header: () => <span>Login URL</span>,
    footer: (props) => props.column.id,
    size: 200
  },
  {
    id: 'customIP',
    accessorKey: 'customIP',
    header: () => <span>Custom IP</span>,
    footer: (props) => props.column.id,
    size: 140
  },
  {
    id: 'proxyIP',
    accessorKey: 'proxyIP',
    header: () => <span>Proxy IP</span>,
    footer: (props) => props.column.id,
    size: 140
  },
  {
    id: 'proxyPort',
    accessorKey: 'proxyPort',
    header: () => <span>Proxy Port</span>,
    footer: (props) => props.column.id,
    size: 100
  },
  {
    id: 'proxyUsername',
    accessorKey: 'proxyUsername',
    header: () => <span>ProxyUsername</span>,
    footer: (props) => props.column.id,
    size: 120
  },
  {
    id: 'proxyPassword',
    accessorKey: 'proxyPassword',
    header: () => <span>ProxyPassword</span>,
    footer: (props) => props.column.id,
    size: 120
  },
  {
    id: 'proxyScope',
    accessorKey: 'proxyScope',
    header: () => <span>ProxyScope</span>,
    footer: (props) => props.column.id,
    size: 100,
    cell: ({ getValue, row, column, table }) => {
      const [isSelectOpen, setIsSelectOpen] = useState(false)
      const handleChange = (value: string) => {
        table.options.meta?.updateData(row.index, column.id, value)
      }

      return (
        <div
          className={`flex px-2 py-0 w-full border border-none ${isSelectOpen ? ' border-border-default bg-blue-200 text-black' : 'border-layout-color'}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Select
            onValueChange={handleChange}
            onOpenChange={(open) => setIsSelectOpen(open)}
            defaultValue={'None'}
            value={getValue() as string}
          >
            <SelectTrigger className="w-24 border-none py-0 h-[20px] focus:border-none  focus:ring-transparent">
              <SelectValue placeholder="None" className="p-0" />
            </SelectTrigger>
            <SelectContent className="w-[100px] ml-[-8px]  border rounded-none border-border-default bg-blue-200">
              <SelectItem
                value="None"
                className="focus:bg-blue-500 focus:text-white p-[1px] m-0 w-full"
              >
                None
              </SelectItem>
              <SelectItem
                value="OnlyLogin"
                className="focus:bg-blue-500 focus:text-white  p-[1px] m-0 w-full"
              >
                OnlyLogin
              </SelectItem>
              <SelectItem
                value="Full"
                className="focus:bg-blue-500 focus:text-white  p-[1px] m-0 w-full"
              >
                Full
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }
  },
  {
    id: 'actions',
    size: 150,
    header: () => <span>Actions</span>,
    cell: ({ row, table }) => {
      const upButtonRef = useRef<HTMLButtonElement>(null)
      const downButtonRef = useRef<HTMLButtonElement>(null)
      const actionCellRef = useRef<HTMLDivElement>(null)

      const [focusTarget, setFocusTarget] = useState<{
        index: number
        direction: 'up' | 'down'
      } | null>(null)

      useEffect(() => {
        if (focusTarget && focusTarget.index === row.index) {
          // Focus vào ô Actions của dòng mới
          actionCellRef.current?.focus()
          setFocusTarget(null)
        }
      }, [row.index, focusTarget])

      const moveRow = (fromIndex: number, toIndex: number, direction: 'up' | 'down') => {
        if (toIndex < 0 || toIndex >= table.options.data.length) return

        const updatedData = [...table.options.data]
        const [movedItem] = updatedData.splice(fromIndex, 1)
        updatedData.splice(toIndex, 0, movedItem)
        setFocusTarget({ index: toIndex, direction })

        table.options.meta?.setData?.(updatedData)
      }

      return (
        <div
          className="flex space-x-2"
          ref={actionCellRef}
          tabIndex={-1} // Để có thể focus được
        >
          <button
            ref={upButtonRef}
            onClick={() => moveRow(row.index, row.index - 1, 'up')}
            disabled={row.index === 0}
            className="w-16 border border-gray-500  px-1 rounded-[3px] h-[18px] hover:bg-blue-200 hover:text-black text-xs"
          >
            ⬆ Up
          </button>
          <button
            ref={downButtonRef}
            onClick={() => moveRow(row.index, row.index + 1, 'down')}
            disabled={row.index === table.options.data.length - 1}
            className="w-16 border border-gray-500 px-1 rounded-[3px] h-[18px]  hover:bg-blue-200 hover:text-black text-xs"
          >
            ⬇ Down
          </button>
        </div>
      )
    }
  }
]

const defaultColumn: Partial<ColumnDef<AccountSwitchType>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = (getValue() as string) ?? ''
    const [value, setValue] = useState<string>(initialValue)
    const [error, setError] = useState<string | null>(null)

    const onBlur = () => {
      table.options.meta?.updateData(index, id, value)
    }

    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      if (id === 'loginID') {
        const allLoginIDs = table.getCoreRowModel().rows.map((row) => row.original.loginID)
        const isDuplicate = allLoginIDs.some(
          (loginID, rowIdx) => loginID === newValue && rowIdx !== index
        )

        if (isDuplicate) {
          setError('This Login ID is already in use.')
          table.options.meta?.setHasError(true)
        } else {
          setError(null)
          table.options.meta?.setHasError(false)
        }
      }
    }

    return (
      <div>
        <input
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          className={`px-1 h-full w-full text-white bg-inherit outline-none rounded-none focus:ring-0 cursor-pointer focus:text-black focus:bg-blue-200 ${
            error ? 'border-red-500' : 'focus:border-blue-500'
          } `}
        />
        {error && <div className="text-white text-xs mt-1">{error}</div>}
      </div>
    )
  }
}

export const Main = ({ setOpenModalSetting, sportsBook }) => {
  const { id: sportsBookId } = useParams()

  const [data, setData] = useState<AccountSwitchType[]>([])
  const [hasError, setHasError] = useState<boolean>(false)
  const [columns] = useState<typeof defaultColumns>(() => [...defaultColumns])
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const [columnResizeDirection] = useState<ColumnResizeDirection>('ltr')
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; colId: string } | null>(null)
  const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, visible: false })
  const [showAlertMsg, setShowAlertMsg] = useState(false)
  const [showAlertMsgAccount, setShowAlertMsgAccount] = useState(false)
  const [duplicateLoginIDs, setDuplicateLoginIDs] = useState<string[]>([])
  const [platForm, setPlatForm] = useState<string>('')
  const [duplicateLoginAccountIDs, setDuplicateLoginAccountIDs] = useState<AccountType[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const openDialog = () => setIsDialogOpen(true)
  const closeDialog = () => setIsDialogOpen(false)
  const [accountCount, setAccountCount] = useState<number>(1)

  const handleClear = () => {
    setData([])
  }

  const handleAddAccounts = () => {
    const newAccounts = Array.from({ length: accountCount }, (_, index) => ({
      id: data.length + index + 1,
      loginID: '',
      password: '',
      customIP: '',
      proxyIP: '',
      loginURL: platForm,
      proxyPort: '',
      proxyUsername: '',
      proxyPassword: '',
      proxyScope: 'None'
    }))
    setData([...data, ...newAccounts])
    closeDialog()
  }

  const handleRightClick = (e) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true
    })
  }

  const handleCloseMenu = () => {
    setContextMenu({ ...contextMenu, visible: false })
  }

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
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
      setData,
      setHasError
    }
  })

  useEffect(() => {
    const fetch = async () => {
      const listAccountSwitchByPlatform = await window.electron.ipcRenderer.invoke(
        'GetListAccountSwitchByPlatform',
        sportsBook.platform
      )
      setData(listAccountSwitchByPlatform)
    }

    const fetchPlatform = async () => {
      const dataFetchPlatform = await window.electron.ipcRenderer.invoke(
        'getPlatform',
        sportsBook.platform
      )

      setPlatForm(dataFetchPlatform)
    }

    fetchPlatform()
    fetch()
  }, [])

  useEffect(() => {
    if (data.length > 0 && !selectedCell) {
      setSelectedCell({ rowIndex: 0, colId: defaultColumns[0].id as string })
    }
  }, [data, selectedCell])

  const handleCellClick = (rowIndex: number, colId: string) => {
    setSelectedCell({ rowIndex, colId })
  }

  const handleSaveAccountList = async () => {
    const dataAccountNew = table.getCoreRowModel().rows.map((row) => {
      const original = row.original
      const trimmedOriginal = Object.fromEntries(
        Object.entries(original).map(([key, value]) =>
          typeof value === 'string' ? [key, value.trim()] : [key, value]
        )
      )
      return trimmedOriginal
    })

    const checkDuplicateLoginIDs = findDuplicateLoginIDs(dataAccountNew)
    const isDuplicate = await checkDuplicateWithAccountList(dataAccountNew)

    if (checkDuplicateLoginIDs.length) {
      setDuplicateLoginIDs(checkDuplicateLoginIDs)
      setShowAlertMsg(true)

      return
    }
    if (isDuplicate.length) {
      setDuplicateLoginAccountIDs(isDuplicate)
      setShowAlertMsgAccount(true)
    }
    window.electron.ipcRenderer.send('SaveAccountListSwitchWindow', {
      sportsBookId,
      platformName: sportsBook.platform,
      dataAccountNew
    })

    setOpenModalSetting(false)
  }

  async function checkDuplicateWithAccountList(dataAccountNew) {
    const listAccountByPlatform = await window.electron.ipcRenderer.invoke(
      'GetListAccountByPlatform',
      sportsBook.platform
    )

    const duplicatedAccounts = listAccountByPlatform.filter((a) =>
      dataAccountNew.some((b) => a.loginID === b.loginID)
    )
    return duplicatedAccounts
  }

  const handleCut = () => {
    if (selectedCell) {
      const { rowIndex, colId } = selectedCell
      const cellValue = data[rowIndex]?.[colId] ?? ''
      navigator.clipboard.writeText(cellValue.toString())

      setData((prevData) =>
        prevData.map((row, index) => (index === rowIndex ? { ...row, [colId]: '' } : row))
      )
    }
  }

  const handleCopy = () => {
    if (selectedCell) {
      const { rowIndex, colId } = selectedCell
      const cellValue = data[rowIndex]?.[colId] ?? ''
      navigator.clipboard.writeText(cellValue.toString())
    } else {
      navigator.clipboard.writeText('')
    }
    handleCloseMenu()
  }

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText()
    if (!selectedCell || !text) return

    const rows = text
      .trim()
      .split('\n')
      .map((line) =>
        line
          .split('\t')
          .map((item) => item.trim())
          .filter((item) => item !== '' && item !== '\r')
      )

    const updatedData = [...data]

    const { rowIndex, colId } = selectedCell
    const startColumnIndex = columns.findIndex((col) => col.id === colId)

    rows.forEach((row, rowOffset) => {
      const targetRowIndex = rowIndex + rowOffset
      if (targetRowIndex >= updatedData.length) return

      row.forEach((cell, colOffset) => {
        const targetColIndex = startColumnIndex + colOffset
        if (targetColIndex >= columns.length) return

        const targetColId = columns[targetColIndex]?.id
        if (targetColId) {
          updatedData[targetRowIndex] = {
            ...updatedData[targetRowIndex],
            [targetColId]: cell
          }
        }
      })
    })

    setData(updatedData)
  }

  return (
    <div className=" h-full py-[16px]" onClick={handleCloseMenu}>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden pt-2">
          <div
            className="h-full w-full border border-border-default bg-bg-gray overflow-hidden"
            onContextMenu={handleRightClick}
          >
            <div
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
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            width: cell.column.getSize(),
                            maxWidth: cell.column.getSize()
                          }}
                          className="border border-border-default p-0 h-3 truncate cursor-pointer text-sm"
                          onClick={() => handleCellClick(row.index, cell.column.id)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {contextMenu.visible && (
              <div
                className="absolute bg-white shadow-md p-[1px] z-[1000] w-40 border border-gray-400"
                style={{
                  top: contextMenu.y,
                  left: contextMenu.x,
                  transform: 'translate(-7px, -18px)'
                }}
              >
                <div
                  className="pl-8 font-medium cursor-pointer border border-white  hover:border-blue-500 hover:bg-blue-100"
                  onClick={handleCut}
                >
                  Cut
                </div>
                <div
                  className="pl-8 font-medium cursor-pointer border border-white  hover:border-blue-500 hover:bg-blue-100 "
                  onClick={handleCopy}
                >
                  Copy
                </div>
                <div
                  className="pl-8 font-medium cursor-pointer border border-white  hover:border-blue-500 hover:bg-blue-100 "
                  onClick={handlePaste}
                >
                  Paste
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex mt-1.5 items-center justify-between">
          <div className="flex gap-2">
            <Button
              className="outline-none hover:border-gray-700 border bg-layout-color hover:bg-inherit border-border-default py-0 px-8 leading-none h-7 font-bold w-24"
              onClick={() => setOpenModalSetting(false)}
            >
              Cancel
            </Button>

            <ClearAccountsDialog onClear={handleClear} />

            <Button
              className="outline-none hover:border-gray-700 border bg-layout-color hover:bg-inherit border-border-default py-0 px-8 leading-none h-7 font-bold w-40"
              onClick={openDialog}
              disabled={hasError}
            >
              Add Accounts
            </Button>
          </div>

          <Button
            className={`${'bg-blue-color'} text-white w-[80px] border-none h-7 font-semibold  hover:bg-opacity-90 rounded-[8px]`}
            onClick={handleSaveAccountList}
            disabled={hasError}
          >
            Save
          </Button>
        </div>

        <NotificationError
          title="Message"
          messageError={`Duplicate Account Detected:\n ${duplicateLoginIDs}`}
          showAlertDialog={showAlertMsg}
          setShowAlertDialog={setShowAlertMsg}
          ReactElement={<InformationCircle className="text-blue-500  mr-1" />}
        />
        <NotificationError
          title="Message"
          messageError={`Duplicate Account List: ${duplicateLoginAccountIDs.map((acc) => acc.loginID).join(', ')}`}
          showAlertDialog={showAlertMsgAccount}
          setShowAlertDialog={setShowAlertMsgAccount}
          ReactElement={<InformationCircle className="text-blue-500  mr-1" />}
        />
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Portal>
            <Dialog.Content
              style={{ zIndex: 9999 }}
              className="fixed top-1/2 left-1/2 w-[300px] p-4 px-6 bg-layout-color border border-border-default rounded-md transform -translate-x-1/2 -translate-y-1/2"
            >
              <Dialog.Title className="text-lg font-medium mt-3">
                Number of accounts to add
              </Dialog.Title>
              <input
                type="number"
                min={1}
                value={accountCount}
                onChange={(e) => setAccountCount(Number(e.target.value))}
                className="mt-2 w-full p-2 border border-border-default rounded-md bg-layout-color"
                placeholder="Enter number"
              />

              <div className="mt-4 flex justify-between">
                <Dialog.Close asChild>
                  <button className="outline-none hover:border-gray-700 border bg-layout-color hover:bg-inherit border-border-default py-0 px-8 leading-none h-9 rounded-[8px] font-bold ">
                    Cancel
                  </button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <button
                    onClick={handleAddAccounts}
                    className={`${'bg-blue-color'} text-white w-[80px] border-none h-9 font-semibold  hover:bg-opacity-90 rounded-[8px]`}
                  >
                    Save
                  </button>
                </Dialog.Close>
              </div>

              <Dialog.Close asChild>
                <button
                  aria-label="Close"
                  className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                >
                  ✕
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  )
}
