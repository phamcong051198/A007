import React, { useContext } from 'react'
import { convertTo24HourFormat } from '@renderer/lib/convertTo24HourFormat'
import { LoginSchedulerSettingContext } from '@renderer/context/LoginSchedulerSettingContext'
import { DAYS_OF_WEEK } from '@shared/common/constants'
import { Checkbox } from '../ui/checkbox'

interface Props {
  type: 'Login' | 'Logout' | string
}

const LoginSetting: React.FC<Props> = ({ type }) => {
  const context = useContext(LoginSchedulerSettingContext)
  if (!context) return null

  const isLoginType = type === 'Login'
  const scheduler = isLoginType
    ? context.loginSetting.loginScheduler
    : context.logoutSetting.logoutScheduler
  const setScheduler = isLoginType
    ? context.loginSetting.setLoginScheduler
    : context.logoutSetting.setLogoutScheduler

  const { isSchedulerEnabled, selectedDays, clickedDay, timeValue, dateValue } = scheduler

  const toggle = () =>
    setScheduler({ ...scheduler, isSchedulerEnabled: !isSchedulerEnabled, clickedDay: null })

  const toggleDay = (day: string) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]

    setScheduler({
      ...scheduler,
      selectedDays: newSelectedDays,
      clickedDay: day
    })
  }

  const toggleAll = () => {
    const allSelected = selectedDays.length === DAYS_OF_WEEK.length
    setScheduler({
      ...scheduler,
      selectedDays: allSelected ? [] : [...DAYS_OF_WEEK],
      clickedDay: null
    })
  }

  const onTime = (e: React.ChangeEvent<HTMLInputElement>) =>
    setScheduler({ ...scheduler, timeValue: convertTo24HourFormat(e.target.value) })

  const onDate = (e: React.ChangeEvent<HTMLInputElement>) =>
    setScheduler({ ...scheduler, dateValue: e.target.value })

  // Kiểm tra xem có tất cả ngày được chọn không
  const isAllSelected = selectedDays.length === DAYS_OF_WEEK.length
  const isIndeterminate = selectedDays.length > 0 && selectedDays.length < DAYS_OF_WEEK.length

  return (
    <div className="flex-1 h-full">
      {/* Header row: toggle + label */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={isLoginType ? 'SchedulerLogin' : 'SchedulerLogout'}
            checked={isSchedulerEnabled}
            onCheckedChange={toggle}
          />
          <label
            htmlFor={isLoginType ? 'SchedulerLogin' : 'SchedulerLogout'}
            className="text-sm select-none text-gray-200"
          >
            {isLoginType ? 'Scheduled Login' : 'Scheduled Logout'}
          </label>
        </div>
        <div className="text-xs text-gray-400">{isSchedulerEnabled ? 'Enabled' : 'Disabled'}</div>
      </div>

      {/* Time & Date */}
      <div className="flex gap-2 px-2 mb-3">
        <input
          type="time"
          className={`px-3 py-1 w-1/2 border rounded text-sm bg-transparent text-gray-200 date-input ${
            isSchedulerEnabled ? 'border-[#2a2d31]' : 'pointer-events-none opacity-40'
          }`}
          // className="appearance-none w-1/2 px-3 py-1 bg-transparent border border-[#2a2d31] rounded text-sm text-gray-200"
          disabled={!isSchedulerEnabled}
          value={convertTo24HourFormat(timeValue)}
          onChange={onTime}
          aria-label={`${type} time`}
        />
        <input
          type="date"
          id={isLoginType ? 'dateLogin' : 'dateLogout'}
          name={isLoginType ? 'dateLogin' : 'dateLogout'}
          disabled={!isSchedulerEnabled}
          className={`px-3 py-1 w-1/2 border rounded text-sm bg-transparent text-gray-200 date-input ${
            isSchedulerEnabled ? 'border-[#2a2d31]' : 'pointer-events-none opacity-40'
          }`}
          value={dateValue}
          onChange={onDate}
          aria-label={`${type} date`}
        />
      </div>

      {/* Days grid */}
      <div className="px-2">
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const checked = selectedDays.includes(day)
            const isActive = clickedDay === day
            const id = isLoginType ? `login-${day}` : `logout-${day}`

            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center p-2 rounded cursor-pointer
                  min-h-[60px] transition-colors duration-150 border
                  ${
                    isActive
                      ? 'border-blue-500 bg-blue-500/10'
                      : checked
                        ? 'border-[#3b4150] bg-[#3b4150]/20'
                        : 'border-transparent hover:border-[#3b4150] hover:bg-[#3b4150]/10'
                  }
                  ${!isSchedulerEnabled ? 'opacity-50 pointer-events-none' : ''}
                `}
                onClick={() => {
                  if (!isSchedulerEnabled) return
                  toggleDay(day)
                }}
              >
                <Checkbox
                  checked={checked}
                  id={id}
                  disabled={!isSchedulerEnabled}
                  onCheckedChange={() => {
                    if (!isSchedulerEnabled) return
                    toggleDay(day)
                  }}
                  className="mb-1"
                />
                <span
                  className={`text-xs leading-none text-center ${
                    isActive
                      ? 'text-white font-medium'
                      : checked
                        ? 'text-gray-200'
                        : 'text-gray-400'
                  }`}
                >
                  {day}
                </span>
              </div>
            )
          })}
        </div>

        {/* Select All */}
        <div className="flex items-center gap-2 mt-4 px-1">
          <Checkbox
            id={isLoginType ? 'SelectAllScheduledLogin' : 'SelectAllScheduledLogout'}
            disabled={!isSchedulerEnabled}
            checked={isAllSelected}
            onCheckedChange={() => {
              if (!isSchedulerEnabled) return
              toggleAll()
            }}
          />
          <label
            htmlFor={isLoginType ? 'SelectAllScheduledLogin' : 'SelectAllScheduledLogout'}
            className={`text-sm select-none cursor-pointer ${
              isSchedulerEnabled ? 'text-gray-200' : 'text-gray-500'
            }`}
            onClick={() => {
              if (!isSchedulerEnabled) return
              toggleAll()
            }}
          >
            Select All {isIndeterminate ? `(${selectedDays.length}/${DAYS_OF_WEEK.length})` : ''}
          </label>
        </div>
      </div>
    </div>
  )
}

export default React.memo(LoginSetting)
