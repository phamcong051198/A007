import React, { useContext } from 'react'
import { LeagueFilterContext } from '@renderer/context/LeagueFilterContext'

const HeaderLeagueFilter = () => {
  const context = useContext(LeagueFilterContext)
  if (!context) return null

  const { filterType } = context.filterType

  return (
    <div
      className={`text-xl font-semibold text-center py-1 bg-white ${filterType == 'Block' ? 'text-[#FF0000]' : 'text-blue-color'}`}
    >
      {filterType == 'Block' ? 'Blocked League' : 'Allowed League'}
    </div>
  )
}

export default React.memo(HeaderLeagueFilter)
