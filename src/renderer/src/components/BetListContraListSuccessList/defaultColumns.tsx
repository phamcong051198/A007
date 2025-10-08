import { cn } from '@renderer/lib/utils'
import clsx from 'clsx'

export const defaultColumns = [
  {
    size: 160,
    accessorKey: 'company',
    header: () => <span>Company</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2`} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'coverage',
    header: () => <span>Coverage</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 80,
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2`} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'gameType',
    header: () => <span>GameType</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 80,
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2 `} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'type',
    header: () => <span>Type</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 50,
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2 `} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'stat',
    header: () => <span>Stat</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 60,
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2 `} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'nameLeague',
    header: () => <span>League</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 170,
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2`} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'nameHome',
    header: () => <span>Home</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 170,
    cell: ({ row }) => {
      const { hdp_point, nameHome } = row.original

      return (
        <span
          className={clsx('px-2', {
            'text-red-color': Number(hdp_point) < 0,
            'text-blue-color': Number(hdp_point) >= 0
          })}
          style={{ whiteSpace: 'nowrap' }}
        >
          {nameHome}
        </span>
      )
    }
  },
  {
    accessorKey: 'nameAway',
    header: () => <span>Away</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 170,
    cell: ({ row }) => {
      const { hdp_point, nameAway } = row.original
      return (
        <span
          className={clsx('px-2', {
            'text-blue-color': Number(hdp_point) <= 0,
            'text-red-color': Number(hdp_point) > 0
          })}
          style={{ whiteSpace: 'nowrap' }}
        >
          {nameAway}
        </span>
      )
    }
  },
  {
    accessorKey: 'bet',
    header: () => <span>Bet</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 170,
    cell: ({ getValue }) => {
      return (
        <span className="text-green-400 px-2" style={{ whiteSpace: 'nowrap' }}>
          {getValue()}
        </span>
      )
    }
  },
  {
    accessorKey: 'HDP',
    header: () => <span>HDP</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 60,
    cell: ({ getValue }) => {
      return (
        <span className={`px-2`} style={{ whiteSpace: 'nowrap' }}>
          {getValue()}
        </span>
      )
    }
  },
  {
    accessorKey: 'odd',
    header: () => <span>Odds</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 70,
    cell: ({ row }) => {
      const company = row.original.company
      const odd = Number(row.original.odd).toFixed(3)
      return (
        <span className={cn(Number(odd) > 0 ? 'text-blue-color px-2' : 'text-red-color px-2')}>
          {company === '' ? '' : odd}
        </span>
      )
    }
  },
  {
    accessorKey: 'betAmount_Standard',
    header: () => <span>Amount</span>,
    footer: ({ column }) => column.id,
    size: 60,
    cell: ({ row: { original } }) => {
      const { company, betAmount_Standard } = original
      return <span className="px-2">{company ? betAmount_Standard || '0' : ''}</span>
    }
  },
  {
    accessorKey: 'time',
    header: () => <span>Time</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 150,
    cell: ({ row }) => {
      const company = row.original.company
      const fullDateTime = row.original.time

      return (
        <span className="px-2" style={{ whiteSpace: 'nowrap' }}>
          {company === '' ? '' : fullDateTime}
        </span>
      )
    }
  },
  {
    accessorKey: 'info',
    header: () => <span>Info</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    cell: ({ getValue }) => {
      const text = getValue() as string
      const getTextClass = (text: string) => {
        switch (true) {
          case text === 'In-progress':
            return 'text-[#FF9900]'
          case text.includes('Bet Success'):
            return 'text-blue-color'
          case text === 'No Bet By User' || text === 'New Match' || text.includes('Out'):
            return 'text-text-default'
          case text === 'Ticket Received':
            return 'text-text-default'
          default:
            return 'text-red-color'
        }
      }
      const textClass = getTextClass(text)
      return (
        <span className={`px-2 ${textClass}`} style={{ whiteSpace: 'nowrap' }} title={text}>
          {text}
        </span>
      )
    }
  },
  {
    accessorKey: 'profit',
    header: () => <span>Profit</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 65,
    cell: ({ row }) => {
      const company = row.original.company
      const profit = row.original.profit
      const color = profit > 0 ? '#00FF7F' : '#FF0000'

      return (
        <span className={`px-2`} style={{ color }}>
          {company === '' ? '' : profit}
        </span>
      )
    }
  },
  {
    accessorKey: 'receiptID',
    header: () => <span>ReceiptID</span>,
    footer: (props: { column: { id: string } }) => props.column.id,
    size: 140,
    cell: ({ row }) => {
      const company = row.original.company
      const receiptID = row.original.receiptID || '-'
      return <span className="px-2"> {company === '' ? '' : receiptID}</span>
    }
  }
]
