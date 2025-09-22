import { ColumnDef } from '@tanstack/react-table'
import { AccountType } from '@shared/common/types'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'

export function createColumnsAccountList({
  onMoveUp,
  onMoveDown
}: {
  onMoveUp: (rowIndex: number) => void
  onMoveDown: (rowIndex: number) => void
}): ColumnDef<AccountType>[] {
  return [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => {
        return (
          <span className="outline-none rounded-none flex items-center justify-center leading-none">
            {row.index + 1}
          </span>
        )
      },
      size: 30
    },
    {
      id: 'loginID',
      accessorKey: 'loginID',
      header: () => <span>Login ID</span>,
      footer: (props) => props.column.id,
      size: 120
    },
    {
      id: 'password',
      accessorKey: 'password',
      header: () => <span>Password</span>,
      footer: (props) => props.column.id,
      size: 120
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
      size: 110
    },
    {
      id: 'proxyIP',
      accessorKey: 'proxyIP',
      header: () => <span>Proxy IP</span>,
      footer: (props) => props.column.id,
      size: 110
    },
    {
      id: 'proxyPort',
      accessorKey: 'proxyPort',
      header: () => <span>Proxy Port</span>,
      footer: (props) => props.column.id,
      size: 110
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
      header: 'Actions',
      size: 150,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => onMoveUp(row.index)}
            className="w-16 border border-gray-500  px-1 rounded-[3px] h-[18px] hover:bg-blue-200 hover:text-black text-xs"
          >
            ⬆ Up
          </button>
          <button
            onClick={() => onMoveDown(row.index)}
            className="w-16 border border-gray-500 px-1 rounded-[3px] h-[18px]  hover:bg-blue-200 hover:text-black text-xs"
          >
            ⬇ Down
          </button>
        </div>
      )
    }
  ]
}
