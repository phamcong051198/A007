import { PerMatchLimitSettingContext } from '@renderer/context/PerMatchLimitSettingContext'
import { useContext } from 'react'
import clsx from 'clsx'
import { CONVERT_HDP } from '@shared/common/constants'

export const defaultColumns = [
  {
    accessorKey: 'sport',
    header: () => <span>Sport</span>,
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id,
    size: 50,
    minSize: 0
  },
  {
    accessorKey: 'coverage',
    header: () => <span>Coverage</span>,
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id,
    size: 70,
    minSize: 0
  },
  {
    accessorKey: 'gameStatus',
    header: () => <span>Game Status</span>,
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id,
    size: 84,
    minSize: 0
  },
  {
    accessorKey: 'redCard',
    header: () => <span>Red Card</span>,
    footer: (props) => props.column.id,
    size: 64,
    minSize: 0
  },
  {
    accessorKey: 'score',
    header: () => <span>Score</span>,
    footer: (props) => props.column.id,
    size: 50,
    minSize: 0
  },
  {
    accessorKey: 'league',
    header: () => <span>League</span>,
    footer: (props) => props.column.id,
    size: 70,
    minSize: 0
  },
  {
    accessorKey: 'home',
    header: () => <span>Home</span>,
    footer: (props) => props.column.id,
    size: 70,
    cell: ({ row }) => {
      const hdp = row.original.HDP
      const key = Object.keys(CONVERT_HDP).find((key) => CONVERT_HDP[key] === hdp)
      const numericKey = key ? parseFloat(key) : -1

      return (
        <span
          className={clsx('px-2', {
            'text-[#FF0000]': numericKey < 0,
            'text-[#0000FF]': numericKey >= 0
          })}
          style={{ whiteSpace: 'nowrap' }}
        >
          {row.original.home}
        </span>
      )
    }
  },
  {
    accessorKey: 'away',
    header: () => <span>Away</span>,
    footer: (props) => props.column.id,
    size: 70,
    cell: ({ row }) => {
      const hdp = row.original.HDP
      const key = Object.keys(CONVERT_HDP).find((key) => CONVERT_HDP[key] === hdp)
      const numericKey = key ? parseFloat(key) : -1

      return (
        <span
          className={clsx('px-2', {
            'text-[#FF0000]': numericKey > 0,
            'text-[#0000FF]': numericKey <= 0
          })}
          style={{ whiteSpace: 'nowrap' }}
        >
          {row.original.away}
        </span>
      )
    }
  },
  {
    accessorKey: 'bet',
    header: () => <span>Bet</span>,
    footer: (props) => props.column.id,
    size: 70,
    cell: ({ getValue }) => {
      return (
        <span className="text-green-500 px-2" style={{ whiteSpace: 'nowrap' }}>
          {getValue()}
        </span>
      )
    }
  },
  {
    accessorKey: 'HDP',
    header: () => <span>HDP</span>,
    footer: (props) => props.column.id,
    size: 70,
    minSize: 0
  },
  {
    accessorKey: 'amount',
    header: () => <span>Amount</span>,
    footer: (props) => props.column.id,
    size: 58,
    minSize: 0
  },
  {
    accessorKey: 'success',
    header: () => <span>Success</span>,
    footer: (props) => props.column.id,
    size: 110,
    cell: ({ row }) => {
      const { count, amount } = row.original
      const context = useContext(PerMatchLimitSettingContext)
      if (!context) {
        throw new Error('PerMatchLimitSettingContext is not provided')
      }
      const { selectedPlatform } = context

      let text =
        selectedPlatform.limitType === 'TotalCount'
          ? `Available Count: ${count}`
          : `Available Amount: ${amount}`

      if (selectedPlatform.limitType === 'TotalCount' && selectedPlatform.totalCount <= count) {
        text = `Fulled: Total Count ${count}`
      } else if (
        selectedPlatform.limitType !== 'TotalCount' &&
        selectedPlatform.totalAmount <= amount
      ) {
        text = `Fulled: Total Amount ${amount}`
      }

      return <span className="text-blue-color underline">{text}</span>
    }
  }
]
