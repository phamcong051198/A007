import React, { useContext, useState } from 'react'
import { LeagueFilterContext } from '@renderer/context/LeagueFilterContext'

const FilterType = () => {
  const context = useContext(LeagueFilterContext)
  if (!context) return null

  const { filterType, setFilterType } = context.filterType
  const [isOpen, setIsOpen] = useState(false)

  const filterOptions = [
    { value: 'Block', label: 'Block list' },
    { value: 'Allow', label: 'Allow list' }
  ]

  const selectedOption = filterOptions.find((option) => option.value === filterType)

  const handleSelect = (value: string) => {
    setFilterType(value)
    setIsOpen(false)
  }

  return (
    <div className="flex items-center justify-between py-3 px-4">
      <h3 className="text-[#F7F7F7] text-sm font-medium">Filtered Leagues</h3>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#13161B] border border-[#22262F] rounded text-[#F7F7F7] text-sm hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        >
          <span>{selectedOption?.label}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-[#13161B] border border-[#22262F] rounded shadow-lg z-10">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-500 hover:text-white transition-colors duration-200 first:rounded-t last:rounded-b ${
                  filterType === option.value ? 'bg-blue-500 text-white' : 'text-[#F7F7F7]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(FilterType)
