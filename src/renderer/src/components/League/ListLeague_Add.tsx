import { v4 as uuidv4 } from 'uuid'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { LeagueFilterContext } from '@renderer/context/LeagueFilterContext'
import { Button } from '../ui/button'
import { getThemeClass } from '@shared/common/constants'

const ListLeague_Add = () => {
  const context = useContext(LeagueFilterContext)
  if (!context) return null

  const { leagues } = context.listLeague
  const { filterType } = context.filterType
  const {
    listBlockLeagueTable,
    setListBlockLeagueTable,
    listAllowLeagueTable,
    setListAllowLeagueTable
  } = context.tableData

  const [selectedLeagues, setSelectedLeagues] = useState<number[]>([])
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<number, HTMLParagraphElement | null>>({})

  // Filter leagues based on search term
  const filteredLeagues = leagues.filter((league) =>
    league.league.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectLeague = (
    event: React.MouseEvent | { ctrlKey?: boolean; shiftKey?: boolean; metaKey?: boolean },
    leagueId: number,
    index: number
  ) => {
    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const newSelection = filteredLeagues.slice(start, end + 1).map((league) => league.id)
      setSelectedLeagues((prev) => Array.from(new Set([...prev, ...newSelection])))
    } else if (event.ctrlKey || event.metaKey) {
      setSelectedLeagues((prev) =>
        prev.includes(leagueId) ? prev.filter((id) => id !== leagueId) : [...prev, leagueId]
      )
    } else {
      setSelectedLeagues([leagueId])
    }
    setLastSelectedIndex(index)
  }

  const handleAddClick = () => {
    const dataLeagueFilter = leagues
      .filter((league) => selectedLeagues.includes(league.id))
      .map((league) => ({
        id: uuidv4(),
        league: league.league
      }))
    setSelectedLeagues([])
    filterType === 'Block'
      ? setListBlockLeagueTable([...listBlockLeagueTable, ...dataLeagueFilter])
      : setListAllowLeagueTable([...listAllowLeagueTable, ...dataLeagueFilter])
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setSelectedLeagues([]) // Clear selections when searching
    setLastSelectedIndex(null)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSelectedLeagues([])
    setLastSelectedIndex(null)
  }

  return (
    <div className="min-w-[280px] bg-[#0C0E12]">
      {/* Search Input */}
      <div className="p-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-[#F7F7F7]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search leagues..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 bg-[#13161B] border border-[#22262F] rounded text-[#F7F7F7] text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* League List */}
      <div className="bg-[#13161B] border border-[#22262F] mx-2 rounded h-[550px]">
        <div ref={containerRef} className="custom-scrollbar overflow-auto h-full">
          {filteredLeagues.length > 0 ? (
            filteredLeagues.map((league, index) => {
              const isSelected = selectedLeagues.includes(league.id)
              return (
                <p
                  key={league.id}
                  ref={(el) => (itemRefs.current[league.id] = el)}
                  className={`mx-[1px] px-3 py-2 text-sm cursor-pointer whitespace-nowrap border-b border-[#22262F] last:border-b-0 ${
                    isSelected
                      ? getThemeClass('bg') + ' text-white'
                      : 'text-[#F7F7F7] hover:text-white ' + getThemeClass('hover')
                  }`}
                  onClick={(event) => handleSelectLeague(event, league.id, index)}
                >
                  {league.league}
                </p>
              )
            })
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {searchTerm ? 'No leagues found' : 'No leagues available'}
            </div>
          )}
        </div>
      </div>

      {/* Add Button */}
      <div className="p-2">
        <Button
          onClick={handleAddClick}
          disabled={selectedLeagues.length === 0}
          className="w-full py-2 px-4 text-white font-medium rounded transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">+</span>
          Add ({selectedLeagues.length})
        </Button>
      </div>
    </div>
  )
}

export default React.memo(ListLeague_Add)
