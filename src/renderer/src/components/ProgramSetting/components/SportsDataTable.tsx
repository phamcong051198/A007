import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { handleSaveReportPerMatchLimit } from '@renderer/lib/handleSaveReportPerMatchLimit'
import { getThemeClass } from '@shared/common/constants'
import { DownloadCloudIcon } from 'lucide-react'
import React, { useEffect } from 'react'

interface GameData {
  id: number
  sport: string
  coverage: string
  gameStatus: 'Upcoming' | 'In Progress' | 'Finished'
  redCard: string
  score: string
  league: string
  home: string
  away: string
  bet: 'Win' | 'Draw' | 'Lose'
  HDP: string
  amount: string
}

interface SportsDataTableProps {
  title: string
  total: number
  showScroll?: boolean
  showSaveReport?: boolean
  data: GameData[]
  enableHorizontalScroll?: boolean
  maxHeight?: string
}

const SportsDataTable: React.FC<SportsDataTableProps> = ({
  title,
  total,
  showScroll = true,
  showSaveReport = true,
  data = [],
  enableHorizontalScroll = true,
  maxHeight = 'max-h-96'
}) => {
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Upcoming: 'bg-[#102A56] text-[#84CAFF]',
      'In Progress': 'bg-[#4E1D09] text-[#FEC84B]',
      Finished: 'bg-[#085D3A] text-[#75E0A7]'
    }

    return (
      <span
        className={`px-2 py-1 rounded-xl text-sm font-medium ${statusStyles[status] || 'bg-gray-600 text-gray-300'}`}
      >
        {status}
      </span>
    )
  }

  const getBetColor = (bet: string) => {
    switch (bet) {
      case 'Over':
        return 'text-green-400'
      case 'Under':
        return 'text-red-400'
      case 'Draw':
        return 'text-gray-400'
      default:
        return 'text-gray-300'
    }
  }

  const handleSaveReport = () => {
    handleSaveReportPerMatchLimit(data)
  }

  return (
    <div className="bg-[#0C0E12] border rounded-t-lg border-[#22262F] w-full flex flex-col">
      {/* Header */}
      <div className="bg-[#0C0E12]  px-4 py-3  rounded-t-lg border-b border-[#22262F] flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">{title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {showScroll && (
              <span className="flex items-center gap-1">
                <Checkbox />
                Scroll
              </span>
            )}
            {showSaveReport && (
              <Button onClick={handleSaveReport}>
                <div className="flex items-center justify-center py-[10px] px-[14px]">
                  <DownloadCloudIcon />
                  <p className="font-semibold text-sm ml-1">Save Report </p>
                </div>
              </Button>
            )}
            <span>Total: {total}</span>
          </div>
        </div>
      </div>
      {/* Table Container - Simplified structure */}
      <div className={`${maxHeight} w-full flex-grow  flex flex-col`}>
        <div
          className={`flex-1  rounded-b-lg ${enableHorizontalScroll ? 'overflow-x-auto' : 'overflow-x-hidden'} overflow-y-auto`}
        >
          <table className="min-w-full table-auto whitespace-nowrap">
            <thead className="bg-[#0C0E12] border-b border-[#22262F] sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[80px]">
                  Sport
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[96px]">
                  Coverage
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[128px]">
                  Game status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[96px]">
                  Red card
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[80px]">
                  Score
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[128px]">
                  League
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[144px]">
                  Home
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[144px]">
                  Away
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[80px]">
                  Bet
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[96px]">
                  HDI
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[96px]">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[96px]">
                  Success
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#0C0E12] divide-y divide-[#22262F]">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-[#13161B] transition-colors h-[72px]">
                    <td className="px-3 py-2 text-sm text-gray-300 truncate">{row?.sport}</td>
                    <td className="px-3 py-2 text-sm text-gray-300 truncate">{row?.coverage}</td>
                    <td className="px-3 py-2 text-sm">{getStatusBadge(row?.gameStatus)}</td>
                    <td
                      className={`px-3 py-2 text-sm truncate ${
                        row?.redCard?.includes('Yes') ? 'text-red-400' : 'text-gray-300'
                      }`}
                    >
                      {row?.redCard ? 'Yes' : 'No'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-300 truncate">
                      {row?.score ? row.score : '0 - 0'}
                    </td>
                    <td
                      className={'px-3 py-2 text-sm truncate ' + getThemeClass('text')}
                      title={row?.league}
                    >
                      {row?.league}
                    </td>
                    <td
                      className={'px-3 py-2 text-sm truncate ' + getThemeClass('text')}
                      title={row?.home}
                    >
                      {row?.home}
                    </td>
                    <td className="px-3 py-2 text-sm  truncate text-red-500" title={row?.away}>
                      {row?.away}
                    </td>
                    <td className={`px-3 py-2 text-sm truncate ${getBetColor(row?.bet)}`}>
                      {row?.bet}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-300 truncate">{row?.HDP}</td>
                    <td className="px-3 py-2 text-sm text-gray-300 truncate">{row?.amount}</td>
                    <td className="px-3 py-2 text-sm truncate text-green-400">Success</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-3 py-4 text-sm text-gray-300 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SportsDataTable
export type { GameData, SportsDataTableProps }
