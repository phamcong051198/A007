import React, { useCallback, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/components/ui/tooltip'
import QuestionMarkCircle from '@renderer/icons/question-mark-circle'

interface SchedulerItemProps {
  label: string
  state: {
    value: number
    input: string
    setValue: (val: number) => void
    setInput: (val: string) => void
  }
  id: string
}

export const SchedulerItem: React.FC<SchedulerItemProps> = ({ label, state, id }) => {
  const [error, setError] = useState<string | null>(null)

  const handleCheckboxChange = useCallback(() => {
    state.setValue(Number(!state.value))
    setError(null)
  }, [state])

  const MAX_ENTRY = 2
  const ENTRY_REGEX = /^(\d{4}-\d{4})(,)?$/

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9\-,]/g, '')
      const entries = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      // Regex cho từng entry
      const entryFormat = /^\d{4}-\d{4}$/
      if (entries.length > 2) {
        setError('Only up to 2 time ranges allowed')
        return
      }
      if (entries.some((entry) => entry && !entryFormat.test(entry))) {
        setError('Format must be hhmm-hhmm, separated by comma')
      } else {
        setError(null)
      }
      state.setInput(value)
    },
    [state]
  )
  return (
    <>
      <div className="flex items-center">
        <div className="flex-1 flex items-center gap-1">
          <input
            type="checkbox"
            id={id}
            checked={Boolean(state.value)}
            onChange={handleCheckboxChange}
            className="cursor-pointer"
          />
          <label htmlFor={id} className="cursor-pointer">
            {label}
          </label>
        </div>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-default">
                <QuestionMarkCircle className="text-blue-500" />
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="bg-gray-50 text-gray-800 border border-gray-300  shadow-lg "
              >
                <p>eg: 0315-1359,1700-2329</p>
                <p>The setting will be ON during:</p>
                <p>(1) 3:15:00 AM ~ 1:59:59 PM</p>
                <p>(2) 5:00:00 AM ~ 11:29:59 PM</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="border border-white">
            <input
              type="text"
              id={`${id}_Text`}
              className={`appearance-none outline-none focus:ring-0 pl-1 border-b focus:border-blue-500 ${
                !state.value ? 'text-gray-500 border-layout-color' : 'text-black border-gray-400'
              }`}
              disabled={!state.value}
              maxLength={19}
              value={state.input}
              onChange={handleInputChange}
              placeholder="eg: 0315-1359,1700-2329"
            />
          </div>
        </div>
      </div>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </>
  )
}
