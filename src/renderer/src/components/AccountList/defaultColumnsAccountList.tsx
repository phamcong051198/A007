import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'

import { AccountType } from '@shared/common/types'

export function createColumnsAccountList({
  onMoveUp,
  onMoveDown
}: {
  onMoveUp: (rowIndex: number) => void
  onMoveDown: (rowIndex: number) => void
}): ColumnDef<AccountType>[] {
  return [
    {
      cell: ({ row }) => {
        return (
          <span className="outline-none rounded-none flex items-center justify-center leading-none">
            {row.index + 1}
          </span>
        )
      },
      header: 'No',
      id: 'no',
      size: 30
    },
    {
      accessorKey: 'loginID',
      footer: (props) => props.column.id,
      header: () => <span>Login ID</span>,
      id: 'loginID',
      size: 120
    },
    {
      accessorKey: 'password',
      footer: (props) => props.column.id,
      header: () => <span>Password</span>,
      id: 'password',
      size: 120
    },
    {
      accessorKey: 'loginURL',
      footer: (props) => props.column.id,
      header: () => <span>Login URL</span>,
      id: 'loginURL',
      size: 200
    },
    {
      accessorKey: 'customIP',
      footer: (props) => props.column.id,
      header: () => <span>Custom IP</span>,
      id: 'customIP',
      size: 110
    },
    {
      accessorKey: 'proxyIP',
      footer: (props) => props.column.id,
      header: () => <span>Proxy IP</span>,
      id: 'proxyIP',
      size: 110
    },
    {
      accessorKey: 'proxyPort',
      footer: (props) => props.column.id,
      header: () => <span>Proxy Port</span>,
      id: 'proxyPort',
      size: 110
    },
    {
      accessorKey: 'proxyUsername',
      footer: (props) => props.column.id,
      header: () => <span>ProxyUsername</span>,
      id: 'proxyUsername',
      size: 120
    },
    {
      accessorKey: 'proxyPassword',
      footer: (props) => props.column.id,
      header: () => <span>ProxyPassword</span>,
      id: 'proxyPassword',
      size: 120
    },
    {
      accessorKey: 'proxyScope',
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
      },
      footer: (props) => props.column.id,
      header: () => <span>ProxyScope</span>,
      id: 'proxyScope',
      size: 100
    },
    {
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
      ),
      header: 'Actions',
      id: 'actions',
      size: 150
    }
  ]
}
