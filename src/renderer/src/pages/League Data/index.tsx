import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import { LeagueType, PlatformType } from '@shared/common/types'

const EditableCell = ({
  row,
  editingRowId,
  setEditingRowId,
  initialValue,
  selectedPlatform,
  setData
}: {
  row
  editingRowId: number | null
  setEditingRowId: (id: number | null) => void
  initialValue: string
  selectedPlatform: PlatformType | null
  setData: React.Dispatch<React.SetStateAction<LeagueType[]>>
}) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleSave = useCallback(() => {
    window.electron.ipcRenderer.send('EditLeagueRoot', {
      selectedPlatform,
      row: {
        ...row.original,
        league: value.trim()
      }
    })
    setData((prev) =>
      prev.map((item) => (item.id === row.original.id ? { ...item, league: value } : item))
    )
    setEditingRowId(null)
  }, [value, row.original, selectedPlatform, setData, setEditingRowId])

  if (editingRowId === row.original.id) {
    return (
      <div className="flex gap-2 items-center justify-between">
        <input
          className="flex-1 border px-2 py-[3px] rounded text-black"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div>
          <button className="px-4 py-1 bg-green-600 text-white rounded mr-2" onClick={handleSave}>
            Save
          </button>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded"
            onClick={() => setEditingRowId(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-center justify-between">
      <span>{initialValue}</span>
      <button
        className="px-2 py-1 bg-blue-600 text-white rounded"
        onClick={() => setEditingRowId(row.original.id)}
      >
        Edit
      </button>
    </div>
  )
}

export default function LeagueData() {
  const [listPlatForm, setListPlatForm] = useState<PlatformType[]>([])
  const [data, setData] = useState<LeagueType[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [editingRowId, setEditingRowId] = useState<number | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null)
  const [filters, setFilters] = useState<{ [key: string]: string }>({
    id: '',
    idLeague: '',
    nameLeague: '',
    league: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetListPlatform')
      setListPlatForm(data)
    }

    fetchData()
    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetListPlatform')
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetLeagueRoot', selectedPlatform)
      setData(data)
    }

    fetchData()
    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetLeagueRoot')
    }
  }, [selectedPlatform])

  // Lọc dữ liệu dựa trên giá trị filter
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true
        return String(item[key as keyof LeagueType])
          .toLowerCase()
          .includes(value.toLowerCase())
      })
    )
  }, [data, filters])

  const columns = React.useMemo<ColumnDef<LeagueType>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        size: 30
      },
      {
        accessorKey: 'idLeague',
        header: 'ID',
        size: 50
      },
      {
        accessorKey: 'nameLeague',
        header: 'Name League',
        size: 200
      },
      {
        accessorKey: 'league',
        header: 'League',
        size: 400,
        cell: ({ row }) => (
          <EditableCell
            row={row}
            editingRowId={editingRowId}
            setEditingRowId={setEditingRowId}
            initialValue={row.original.league}
            selectedPlatform={selectedPlatform}
            setData={setData}
          />
        )
      }
    ],
    [editingRowId, selectedPlatform]
  )

  const table = useReactTable({
    columns,
    data: filteredData, // Sử dụng dữ liệu đã lọc
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting
    }
  })

  // Xử lý thay đổi giá trị filter
  const handleFilterChange = (columnId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }))
  }

  return (
    <div className="h-full">
      <div className="flex gap-5 h-full px-5">
        <div className="w-48">
          <h2 className="font-extrabold text-lg">Platform</h2>
          <ul className="border border-border-default bg-bg-gray">
            {listPlatForm.map((plat) => (
              <li
                key={plat.id}
                className={`p-2 hover:bg-gray-700 cursor-pointer ${
                  selectedPlatform?.id === plat.id ? 'bg-blue-600 text-white' : ''
                }`}
                onClick={() => setSelectedPlatform(plat)}
              >
                {plat.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <h2 className="font-extrabold text-lg">List League</h2>
          <div className="border border-border-default h-[870px]">
            <div className="h-full overflow-auto text-sm">
              <table className="w-full table-fixed bg-bg-gray">
                <thead className="sticky top-0 bg-gray-800 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <React.Fragment key={headerGroup.id}>
                      {/* Hàng header chính */}
                      <tr>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            style={{ width: header.getSize() }}
                            className="border-r-[1px] border-border-default px-2 py-1"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽'
                            }[header.column.getIsSorted() as string] ?? null}
                          </th>
                        ))}
                      </tr>
                      {/* Hàng filter */}
                      <tr>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={`${header.id}-filter`}
                            style={{ width: header.getSize() }}
                            className="border-r-[1px] border-border-default px-2 py-1"
                          >
                            <input
                              type="text"
                              value={filters[header.column.id] || ''}
                              onChange={(e) => handleFilterChange(header.column.id, e.target.value)}
                              placeholder={`Filter ${header.column.columnDef.header}`}
                              className="w-full border px-2 py-1 rounded text-black "
                            />
                          </th>
                        ))}
                      </tr>
                    </React.Fragment>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-t-[1px] border-border-default">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="border-r-[1px] border-border-default px-2 py-1"
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
