import React, { useContext } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/components/ui/tooltip'
import { LeagueFilterContext } from '@renderer/context/LeagueFilterContext'
import QuestionMarkCircle from '@renderer/icons/question-mark-circle'
import { MAJOR_LEAGUE } from '@shared/common/constants'
import { Checkbox } from '../ui/checkbox'

const ActionTableLeagueFilter = ({ handleCopy, handlePaste }) => {
  const context = useContext(LeagueFilterContext)
  if (!context) return null

  const { filterType } = context.filterType
  const { blockMajorLeague, setBlockMajorLeague, allowMajorLeague, setAllowMajorLeague } =
    context.actionCheckBoxMajorLeague

  const stateCheckBox = filterType === 'Block' ? blockMajorLeague : allowMajorLeague
  const setCheckBox = filterType === 'Block' ? setBlockMajorLeague : setAllowMajorLeague

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-[#13161B] border-b border-[#22262F]">
      {/* Left side - Checkbox with label */}
      <div className="flex items-center gap-2">
        <Checkbox
          name="BlockMajorLeague"
          id="BlockMajorLeague"
          checked={Boolean(stateCheckBox)}
          onCheckedChange={(checked) => setCheckBox(Number(checked))}
        />
        <label htmlFor="BlockMajorLeague" className="text-[#F7F7F7] text-sm">
          {filterType === 'Block' ? 'Block Major Leagues' : 'Allow Major Leagues'}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <QuestionMarkCircle className="text-[#F7F7F7] w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent className="bg-[#13161B] text-[#F7F7F7] border border-[#22262F] rounded shadow-lg">
              {MAJOR_LEAGUE.map((league, index) => (
                <div key={league.league} className="text-sm">
                  {index + 1}) {league.league.replace('%', '')}
                </div>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePaste}
          className="px-3 py-1.5 bg-[#13161B] border border-[#22262F] rounded text-[#F7F7F7] text-sm hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200"
        >
          Paste League
        </button>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 bg-[#13161B] border border-[#22262F] rounded text-[#F7F7F7] text-sm hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200"
        >
          Copy League
        </button>
      </div>
    </div>
  )
}

export default React.memo(ActionTableLeagueFilter)
