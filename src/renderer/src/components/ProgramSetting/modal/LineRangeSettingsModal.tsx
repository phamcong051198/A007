import React, { Dispatch, SetStateAction, useState, useContext } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { InputNumber } from '@renderer/components/ui/input-number'
import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import { CHECK_BOX_DETAIL_SETTING, HDP_OPTIONS } from '@shared/renderer/constants'
import { handleDataTableMinutes } from '@renderer/lib/handleDataTableMinutes'
import { handleDataRange } from '@renderer/lib/handleDataRange'
import { updateObject } from '@renderer/lib/updateBetTo'
import { RangeType, BetToType, RowType } from '@shared/common/types'
import { Input } from '@renderer/components/ui/input'
import { getThemeClass } from '@shared/common/constants'

interface LineRangeData {
  betOnAllTypes: boolean
  betOnSelectedTypes: boolean
  gameTypes: {
    today: boolean
    early: boolean
    running: boolean
    allMinutes: boolean
  }
  minutesRanges: RowType[]
  checkOdds: boolean
  oddsFrom: number
  oddsTo: number
}

const LineRangeSettingsModal = ({
  setShowAmountRounderSetting,
  typeAccount,
  lineKey
}: {
  setShowAmountRounderSetting: Dispatch<SetStateAction<boolean>>
  typeAccount: 'account1' | 'account2'
  lineKey: string
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { currentAccountPair, listAccountPair, setListAccountPair } = Combination

  // Thêm flag để track xem có thay đổi nào chưa được save
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize BetTo data from specific line
  const [dataBetTo, setDataBetTo] = useState<BetToType>(() => {
    if (lineKey && currentAccountPair?.[typeAccount]?.[`${lineKey}_Detail`]) {
      return currentAccountPair[typeAccount][`${lineKey}_Detail`]?.betTo || {}
    }
    const firstEnabledSetting = CHECK_BOX_DETAIL_SETTING.find(
      (item) => currentAccountPair?.[typeAccount]?.[item.key] === 1
    )
    return firstEnabledSetting
      ? currentAccountPair[typeAccount][`${firstEnabledSetting.key}_Detail`]?.betTo || {}
      : {}
  })

  const initializeLineRangeData = (): LineRangeData => {
    if (!currentAccountPair?.[typeAccount]) {
      return {
        betOnAllTypes: true,
        betOnSelectedTypes: false,
        gameTypes: {
          today: false,
          early: false,
          running: false,
          allMinutes: false
        },
        minutesRanges: [{ id: uuidv4(), minutesFrom: '', minutesTo: '' }],
        checkOdds: false,
        oddsFrom: 0.01,
        oddsTo: 0.01
      }
    }

    const rangeData = (() => {
      if (lineKey && currentAccountPair?.[typeAccount]?.[`${lineKey}_Detail`]) {
        return currentAccountPair[typeAccount][`${lineKey}_Detail`]?.range
      }
      const firstEnabledSetting = CHECK_BOX_DETAIL_SETTING.find(
        (item) => currentAccountPair[typeAccount][item.key] === 1
      )
      return firstEnabledSetting
        ? currentAccountPair[typeAccount][`${firstEnabledSetting.key}_Detail`]?.range
        : null
    })()

    const initialMinutesRanges =
      rangeData?.arrayMinutes?.map((item: { minutesFrom: string; minutesTo: string }) => ({
        id: uuidv4(),
        minutesFrom: item.minutesFrom || '',
        minutesTo: item.minutesTo || ''
      })) || []

    initialMinutesRanges.push({ id: uuidv4(), minutesFrom: '', minutesTo: '' })

    return {
      betOnAllTypes: rangeData?.betAll === 1,
      betOnSelectedTypes: rangeData?.betAll !== 1,
      gameTypes: {
        today: rangeData?.today === 1 || false,
        early: rangeData?.early === 1 || false,
        running: rangeData?.running === 1 || false,
        allMinutes: rangeData?.allMinutes === 1 || false
      },
      minutesRanges:
        initialMinutesRanges.length > 0
          ? initialMinutesRanges
          : [{ id: uuidv4(), minutesFrom: '', minutesTo: '' }],
      checkOdds: rangeData?.checkOdd === 1 || false,
      oddsFrom: parseFloat(rangeData?.oddFrom) || 0.01,
      oddsTo: parseFloat(rangeData?.oddTo) || 0.01
    }
  }

  const [lineRangeData, setLineRangeData] = useState<LineRangeData>(initializeLineRangeData)

  // BetTo logic với flag tracking
  const updateHdp = (field: string, value: number) => {
    setHasUnsavedChanges(true)

    if (field === 'selectAll') {
      const newState = HDP_OPTIONS.reduce((acc, hdp) => {
        acc[hdp.key] = value
        return acc
      }, {} as BetToType)

      setDataBetTo({
        ...newState,
        selectAll: value
      })
    } else {
      const updatedData = { ...dataBetTo, [field]: value }
      const allSelected = HDP_OPTIONS.every((hdp) => updatedData[hdp.key])
      updatedData.selectAll = Number(allSelected)

      setDataBetTo(updatedData)
    }
  }

  // Handle range settings với flag tracking
  const handleRangeTypeChange = (value: string) => {
    setHasUnsavedChanges(true)
    setLineRangeData((prev) => ({
      ...prev,
      betOnAllTypes: value === 'betOnAllTypes',
      betOnSelectedTypes: value === 'betOnSelectedTypes'
    }))
  }

  const handleGameTypeChange = (
    gameType: keyof typeof lineRangeData.gameTypes,
    checked: boolean
  ) => {
    setHasUnsavedChanges(true)
    setLineRangeData((prev) => ({
      ...prev,
      gameTypes: {
        ...prev.gameTypes,
        [gameType]: checked
      }
    }))
  }

  const handleInputChange = (id: string, field: 'minutesFrom' | 'minutesTo', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) {
      return
    }

    setHasUnsavedChanges(true)
    setLineRangeData((prev) => {
      const updatedRanges = prev.minutesRanges.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )

      const currentRowIndex = prev.minutesRanges.findIndex((row) => row.id === id)
      const isLastRow = currentRowIndex === prev.minutesRanges.length - 1
      const currentRow = updatedRanges[currentRowIndex]

      if (isLastRow && currentRow.minutesFrom && currentRow.minutesTo) {
        updatedRanges.push({ id: uuidv4(), minutesFrom: '', minutesTo: '' })
      }

      return {
        ...prev,
        minutesRanges: updatedRanges
      }
    })
  }

  const handleCheckOdds = (checked: boolean) => {
    setHasUnsavedChanges(true)
    setLineRangeData((prev) => ({
      ...prev,
      checkOdds: checked
    }))
  }

  const handleOddsChange = (field: 'oddsFrom' | 'oddsTo', value: number) => {
    setHasUnsavedChanges(true)
    setLineRangeData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // Function để update AccountPairContext một cách an toàn
  const updateAccountPairContext = (betToData: BetToType, rangeData: RangeType) => {
    if (!currentAccountPair || !lineKey) return false

    try {
      // Update chỉ line được chỉ định, tránh conflict với các component khác
      const updatedAccountPair = {
        ...currentAccountPair,
        [typeAccount]: {
          ...currentAccountPair[typeAccount],
          [`${lineKey}_Detail`]: {
            ...currentAccountPair[typeAccount][`${lineKey}_Detail`],
            range: rangeData,
            betTo: betToData,
            lastUpdated: Date.now() // Thêm timestamp để track
          }
        }
      }

      // Update list với debounce để tránh multiple updates
      const updatedList = listAccountPair.map((pair) =>
        pair.id === currentAccountPair.id ? updatedAccountPair : pair
      )

      setListAccountPair(updatedList)
      return true
    } catch (error) {
      console.error('Error updating account pair context:', error)
      return false
    }
  }

  // Save settings với proper error handling
  const handleSave = async () => {
    if (!currentAccountPair || !lineKey || isSaving) return

    setIsSaving(true)

    try {
      // Prepare range data
      const dataArrayMinutes = handleDataTableMinutes(lineRangeData.minutesRanges)
      const rangeData: RangeType = {
        betAll: lineRangeData.betOnAllTypes ? 1 : 0,
        today: lineRangeData.gameTypes.today ? 1 : 0,
        early: lineRangeData.gameTypes.early ? 1 : 0,
        running: lineRangeData.gameTypes.running ? 1 : 0,
        allMinutes: lineRangeData.gameTypes.allMinutes ? 1 : 0,
        checkOdd: lineRangeData.checkOdds ? 1 : 0,
        oddFrom: lineRangeData.oddsFrom.toString(),
        oddTo: lineRangeData.oddsTo.toString(),
        arrayMinutes: dataArrayMinutes
      }

      const dataRangeUpdate = handleDataRange(rangeData)

      // Process BetTo data
      updateObject(dataBetTo)

      // Update context
      const success = updateAccountPairContext(dataBetTo, dataRangeUpdate)

      if (success) {
        setHasUnsavedChanges(false)
        setShowAmountRounderSetting(false)
      } else {
        console.error('Failed to save changes')
        // Có thể thêm notification error ở đây
      }
    } catch (error) {
      console.error('Error saving line range settings:', error)
      // Có thể thêm notification error ở đây
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setShowAmountRounderSetting(false)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowAmountRounderSetting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#0C0E12] border border-[#22262F] rounded-lg max-w-7xl w-full max-h-[80vh] overflow-auto">
        <div className="px-6 py-4 border-b border-[#22262F]">
          <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            {lineKey} - Line & Range settings (
            {typeAccount === 'account1' ? 'Account 1' : 'Account 2'})
            {hasUnsavedChanges && (
              <span className="text-yellow-400 text-sm">• Unsaved changes</span>
            )}
          </h2>
        </div>

        <div className="flex">
          {/* Line Settings */}
          <div className="w-2/3 border-r border-[#22262F]">
            <div className="p-4 border-b border-[#22262F] font-semibold text-gray-200">
              <label className="flex items-center">
                <Checkbox
                  checked={Boolean(dataBetTo.selectAll)}
                  onCheckedChange={(checked) => updateHdp('selectAll', Number(checked as boolean))}
                />
                <span className="ml-2 text-gray-300 font-medium">Select All</span>
              </label>
            </div>
            <div className="p-4">
              {/* BetTo Settings */}
              <div className="grid grid-cols-10 gap-3">
                {HDP_OPTIONS.map((hdp: { key: string; label: string }) => (
                  <label key={`${hdp.key}_${typeAccount}`} className="inline-flex items-center">
                    <Checkbox
                      checked={Boolean(dataBetTo[hdp.key])}
                      onCheckedChange={(checked) => updateHdp(hdp.key, Number(checked as boolean))}
                    />
                    <span
                      className={`ml-2 text-sm cursor-pointer ${
                        dataBetTo[hdp.key] === 1
                          ? getThemeClass('text') + ' font-semibold'
                          : 'text-gray-300'
                      }`}
                    >
                      {hdp.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Range Settings */}
          <div className="w-1/3">
            <div className="p-4 border-b border-[#22262F] font-semibold text-gray-200">
              Range settings
            </div>
            <div className="p-4">
              <div className="flex items-center pb-6 border-b pt-2 border-[#22262F]">
                <RadioGroup
                  value={lineRangeData.betOnAllTypes ? 'betOnAllTypes' : 'betOnSelectedTypes'}
                  onValueChange={handleRangeTypeChange}
                  className="flex flex-col w-full"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="betOnAllTypes" id="betOnAllTypes" />
                    <Label htmlFor="betOnAllTypes" className="text-sm font-medium text-gray-300">
                      Bet on all types
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="betOnSelectedTypes" id="betOnSelectedTypes" />
                    <Label
                      htmlFor="betOnSelectedTypes"
                      className="text-sm font-medium text-gray-300"
                    >
                      Bet on selected types
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex">
                <div className="w-1/3 pt-4 text-gray-300">Game Type</div>
                <div className="grid grid-cols-2 gap-4 pt-4 w-2/3">
                  <label className="inline-flex items-center">
                    <Checkbox
                      checked={lineRangeData.gameTypes.today}
                      onCheckedChange={(checked) =>
                        handleGameTypeChange('today', checked as boolean)
                      }
                      disabled={lineRangeData.betOnAllTypes}
                    />
                    <span className="ml-2 text-gray-300">Today</span>
                  </label>
                  <label className="inline-flex items-center">
                    <Checkbox
                      checked={lineRangeData.gameTypes.early}
                      onCheckedChange={(checked) =>
                        handleGameTypeChange('early', checked as boolean)
                      }
                      disabled={lineRangeData.betOnAllTypes}
                    />
                    <span className="ml-2 text-gray-300">Early</span>
                  </label>
                  <label className="inline-flex items-center">
                    <Checkbox
                      checked={lineRangeData.gameTypes.running}
                      onCheckedChange={(checked) =>
                        handleGameTypeChange('running', checked as boolean)
                      }
                      disabled={lineRangeData.betOnAllTypes}
                    />
                    <span className="ml-2 text-gray-300">Running</span>
                  </label>
                  <label className="inline-flex items-center">
                    <Checkbox
                      checked={lineRangeData.gameTypes.allMinutes}
                      onCheckedChange={(checked) =>
                        handleGameTypeChange('allMinutes', checked as boolean)
                      }
                      disabled={
                        lineRangeData.betOnAllTypes || lineRangeData.gameTypes.running === false
                      }
                    />
                    <span className="ml-2 text-gray-300">All minutes</span>
                  </label>
                </div>
              </div>

              {/* Minutes Range Table */}
              <div className="block pt-4">
                <div className="bg-[#0C0E12] rounded-lg border border-[#22262F] overflow-hidden">
                  <div className="px-4 py-3 bg-[#0C0E12] border-b border-[#22262F]">
                    <div className="grid grid-cols-[30px_1fr_1fr] gap-4 font-semibold text-gray-200">
                      <div>#</div>
                      <div>Minutes from</div>
                      <div>Minutes to</div>
                    </div>
                  </div>

                  <div className="overflow-y-auto h-64">
                    {lineRangeData.minutesRanges.map((row, index) => (
                      <div
                        key={row.id}
                        className={`px-4 py-3 text-gray-300 bg-[#0C0E12] grid grid-cols-[30px_1fr_1fr] gap-4 items-center ${
                          index !== lineRangeData.minutesRanges.length - 1
                            ? 'border-b border-[#22262F]'
                            : ''
                        }`}
                      >
                        <div className="text-gray-400">{index + 1}</div>
                        <Input
                          type="text"
                          value={row.minutesFrom}
                          onChange={(e) => handleInputChange(row.id, 'minutesFrom', e.target.value)}
                          disabled={
                            lineRangeData.betOnAllTypes || lineRangeData.gameTypes.allMinutes
                          }
                          className="bg-transparent border border-[#22262F] rounded px-2 py-1 text-gray-300 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                          placeholder="From"
                          maxLength={3}
                        />
                        <Input
                          type="text"
                          value={row.minutesTo}
                          onChange={(e) => handleInputChange(row.id, 'minutesTo', e.target.value)}
                          disabled={
                            lineRangeData.betOnAllTypes || lineRangeData.gameTypes.allMinutes
                          }
                          className="bg-transparent border border-[#22262F] rounded px-2 py-1 text-gray-300 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                          placeholder="To"
                          maxLength={3}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Odds Settings */}
              <div className="flex py-4 gap-4">
                <label className="w-1/3 gap-1">
                  <div className="flex items-center">
                    <Checkbox checked={lineRangeData.checkOdds} onCheckedChange={handleCheckOdds} />
                    <span className="ml-2 text-gray-300">Check Odds</span>
                  </div>
                </label>
                <div className="w-1/3">
                  <div className="pb-2 text-gray-300">From</div>
                  <InputNumber
                    value={lineRangeData.oddsFrom}
                    onChange={(value) => handleOddsChange('oddsFrom', value)}
                    disabled={!lineRangeData.checkOdds}
                    precision={2}
                    step={0.01}
                    min={-1}
                    max={1}
                    className="w-full"
                  />
                </div>
                <div className="w-1/3">
                  <div className="pb-2 text-gray-300">To</div>
                  <InputNumber
                    value={lineRangeData.oddsTo}
                    onChange={(value) => handleOddsChange('oddsTo', value)}
                    disabled={!lineRangeData.checkOdds}
                    precision={2}
                    step={0.01}
                    min={-1}
                    max={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-[#22262F]">
          <div className="flex justify-end py-4 px-6">
            <div className="gap-4 flex">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="bg-transparent border-gray-400 text-gray-300 hover:bg-gray-700"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(LineRangeSettingsModal)
