import clsx from 'clsx'

import { cn } from '@renderer/lib/utils'

export const defaultColumns = [
  {
    accessorKey: 'company',
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2`} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>Company</span>,
    size: 160
  },
  {
    accessorKey: 'coverage',
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2`} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>Coverage</span>,
    size: 72
  },
  {
    accessorKey: 'gameType',
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2 `} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>GameType</span>,
    size: 80
  },
  // {
  //   accessorKey: 'type',
  //   cell: ({ getValue }) => {
  //     const text = getValue()
  //     return (
  //       <span className={`px-2 `} style={{ whiteSpace: 'nowrap' }}>
  //         {text}
  //       </span>
  //     )
  //   },
  //   footer: (props: { column: { id: string } }) => props.column.id,
  //   header: () => <span>Type</span>,
  //   size: 40
  // },
  {
    accessorKey: 'stat',
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2 `} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>Stat</span>,
    size: 60
  },
  {
    accessorKey: 'nameLeague',
    cell: ({ getValue }) => {
      const text = getValue()
      return (
        <span className={`px-2`} style={{ whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>League</span>,
    size: 170
  },
  {
    accessorKey: 'nameHome',
    cell: ({ row }) => {
      const { hdp_point, nameHome } = row.original

      return (
        <span
          className={clsx('px-2', {
            'text-blue-color': Number(hdp_point) >= 0,
            'text-red-color': Number(hdp_point) < 0
          })}
          style={{ whiteSpace: 'nowrap' }}
        >
          {nameHome}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>Home</span>,
    size: 170
  },
  {
    accessorKey: 'nameAway',
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
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>Away</span>,
    size: 170
  },
  {
    accessorKey: 'bet',
    cell: ({ getValue }) => {
      return (
        <span className="text-green-color px-2" style={{ whiteSpace: 'nowrap' }}>
          {getValue()}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>Bet</span>,
    size: 100
  },
  {
    accessorKey: 'HDP',
    cell: ({ getValue }) => {
      return (
        <span className={`px-2`} style={{ whiteSpace: 'nowrap' }}>
          {getValue()}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>HDP</span>,
    size: 50
  },
  {
    accessorKey: 'odd',
    cell: ({ row }) => {
      const company = row.original.company
      const odd = Number(row.original.odd).toFixed(3)
      return (
        <span className={cn(Number(odd) > 0 ? 'text-blue-color px-2' : 'text-red-color px-2')}>
          {company === '' ? '' : odd}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>Odds</span>,
    size: 70
  },
  {
    accessorKey: 'profit',
    cell: ({ row }) => {
      const company = row.original.company
      const profit = row.original.profit
      const color = profit > 0 ? '#32CD32' : '#FF0000'

      return (
        <span className={`px-2 font-bold`} style={{ color }}>
          {company === '' ? '' : profit}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>Profit</span>,
    size: 55
  },
  {
    accessorKey: 'betAmount_Standard',
    cell: ({ row: { original } }) => {
      const { company, betAmount_Standard } = original
      return <span className="px-2">{company ? betAmount_Standard || '0' : ''}</span>
    },
    footer: ({ column }) => column.id,
    header: () => <span>Amount</span>,
    size: 60
  },
  // {
  //   accessorKey: 'time',
  //   cell: ({ row }) => {
  //     const company = row.original.company
  //     const fullDateTime = row.original.time

  //     return (
  //       <span className="px-2" style={{ whiteSpace: 'nowrap' }}>
  //         {company === '' ? '' : fullDateTime}
  //       </span>
  //     )
  //   },
  //   footer: (props: { column: { id: string } }) => props.column.id,
  //   header: () => <span>Time</span>,
  //   size: 130
  // },
  {
    accessorKey: 'info',
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
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>Info</span>,
    size: 82
  },

  {
    accessorKey: 'receiptID',
    cell: ({ row }) => {
      const company = row.original.company
      const receiptID = row.original.receiptID || '-'
      return <span className="px-2"> {company === '' ? '' : receiptID}</span>
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>ReceiptID</span>,
    size: 180
  },
  {
    accessorKey: 'resultBet',
    cell: ({ row }) => {
      const resultBetRaw = row?.original?.resultBet || ''
      const resultBet = resultBetRaw.toUpperCase()

      const isWin = resultBet === 'WIN' || resultBet === 'WON'

      return (
        <span className={`px-2 font-semibold ${isWin ? 'text-[#0000FF]' : 'text-[#FF0000]'}`}>
          {resultBet}
        </span>
      )
    },
    footer: (props: { column: { id: string } }) => props.column.id,
    header: () => <span>ResultBet</span>,
    size: 72
  }
]
