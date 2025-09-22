import { SettingContext } from '@renderer/context/SettingContext'
import BoxLabel from '@renderer/layouts/BoxLabel'
import { useContext, useState, useMemo } from 'react'
import { calculateRoundedValue } from '@renderer/lib/calculateRoundedValue'
import { checkInputFormatScheduler } from '@renderer/lib/checkInputFormatScheduler'
import { validateBettingFields } from '@renderer/lib/utils'
import { TEXT_MESSAGE_ERROR_DEFAULT, VALUE_DEFAULT_ODDS_SETTING } from '@shared/renderer/constants'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'

import { SwitchCustom } from '../ui/switch'
import { Checkbox } from '../ui/checkbox'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { InputNumber } from '../ui/input-number'
import { Label } from '../ui/label'
import { SchedulerItem } from './components/SchedulerItem'
import { Button } from '../ui/button'
import { NotificationBetAmountRandom } from '@renderer/components/Setting/ButtonSaveSettings/NotificationBetAmountRandom'
import { CheckCircle } from 'lucide-react'

export default function GeneralSetting() {
  const context = useContext(SettingContext)

  const [showTestResult, setShowTestResult] = useState(false)
  const [testResult, setTestResult] = useState('')
  const [title, setTitle] = useState('Notification')
  const [messageError, setMessageError] = useState('')
  const [showAlertMsg, setShowAlertMsg] = useState(false)

  if (!context) return null

  const { firstHalfState, setFirstHalfState } = context.firstHalf
  const { secondHalfState, setSecondHalfState } = context.secondHalf
  const { bettingModeState, setBettingModeState } = context.bettingMode

  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const {
    enableRandomizer,
    setRandomizerEnabled,
    fromRandomizer,
    setFromValue,
    toRandomizer,
    setToValue
  } = context.betAmountRandom
  const { checkboxStates, setCheckboxStates, inputValuesOddsSetting, setInputValuesOddsSetting } =
    context.oddsSetting

  const handleSaveSetting = () => {
    for (const key in inputValuesOddsSetting) {
      const value = parseFloat(inputValuesOddsSetting[key])
      if (isNaN(value) || value < -1 || value > 1) {
        setInputValuesOddsSetting({ [key]: VALUE_DEFAULT_ODDS_SETTING[key] })
        setTitle('Notification Odds Setting')
        setMessageError(TEXT_MESSAGE_ERROR_DEFAULT[key])
        setShowAlertMsg(true)
        return
      } else {
        setInputValuesOddsSetting({ [key]: value.toFixed(2) })
      }
    }
    const valueHalfBetting = validateBettingFields(
      firstHalfState?.firstStHalfBettingForm,
      firstHalfState.firstStHalfBettingUntil,
      0,
      45,
      firstHalfState?.enableFirstStHalf
    )

    const valueSecondBetting = validateBettingFields(
      secondHalfState?.secondStHalfBettingForm,
      secondHalfState.secondStHalfBettingUntil,
      46,
      90,
      secondHalfState?.enableSecondStHalf
    )

    window.electron.ipcRenderer.send('SaveSettingWindow', {
      profitMin:
        isNaN(parseFloat(context.oddsTypeSetting.profitMin as string)) ||
        parseFloat(context.oddsTypeSetting.profitMin as string) < -1
          ? '-1'
          : context.oddsTypeSetting.profitMin,
      profitMax:
        isNaN(parseFloat(context.oddsTypeSetting.profitMax as string)) ||
        parseFloat(context.oddsTypeSetting.profitMax as string) > 1
          ? '1'
          : context.oddsTypeSetting.profitMax,
      gameType: context.gameType.gameType,
      oddsLessThan: checkboxStates.oddsLessThan,
      oddsMoreThan: checkboxStates.oddsMoreThan,
      gameCommissionMoreThan: checkboxStates.gameCommissionMoreThan,
      gameCommissionLessThan: checkboxStates.gameCommissionLessThan,
      oddsLessThanValue: inputValuesOddsSetting.oddsLessThanValue,
      oddsMoreThanValue: inputValuesOddsSetting.oddsMoreThanValue,
      gameCommissionMoreThanValue: inputValuesOddsSetting.gameCommissionMoreThanValue,
      gameCommissionLessThanValue: inputValuesOddsSetting.gameCommissionLessThanValue,
      enableRandomizer,
      fromRandomizer,
      toRandomizer,
      enableFirstStHalf: firstHalfState.enableFirstStHalf,
      betFirstHalf: firstHalfState.betFirstHalf,
      betFullTime: firstHalfState.betFullTime,
      enableSecondStHalf: secondHalfState.enableSecondStHalf,
      betHalfTime: secondHalfState.betHalfTime,
      firstStHalfBettingForm: String(valueHalfBetting[0]),
      firstStHalfBettingUntil: String(valueHalfBetting[1]),
      secondStHalfBettingForm: String(valueSecondBetting[0]),
      secondStHalfBettingUntil: String(valueSecondBetting[1]),
      bettingMode: bettingModeState.bettingMode,
      amountRoundingEnabled: bettingModeState.amountRoundingEnabled,
      roundType: bettingModeState.roundType,
      roundingNumber: bettingModeState.roundingNumber,
      schedulerRunning: context.gameTypeScheduler.running.value,
      schedulerInputRunning: checkInputFormatScheduler(context.gameTypeScheduler.running.input),
      schedulerToday: context.gameTypeScheduler.today.value,
      schedulerInputToday: checkInputFormatScheduler(context.gameTypeScheduler.today.input),
      schedulerEarly: context.gameTypeScheduler.early.value,
      schedulerInputEarly: checkInputFormatScheduler(context.gameTypeScheduler.early.input)
    })

    setShowSaveSuccess(true)
    setMessageSuccess('Save successful!')
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 1500)
  }

  const handleResetAllChanges = () => {
    // Reset first half settings (giống SettingContext initial state)
    setFirstHalfState({
      enableFirstStHalf: 1,
      betFirstHalf: 1,
      betFullTime: 1,
      firstStHalfBettingForm: '0',
      firstStHalfBettingUntil: '45'
    })

    // Reset second half settings (giống SettingContext initial state)
    setSecondHalfState({
      enableSecondStHalf: 1,
      betHalfTime: 1,
      secondStHalfBettingForm: '46',
      secondStHalfBettingUntil: '90'
    })

    // Reset betting mode settings (giống SettingContext initial state)
    setBettingModeState({
      bettingMode: 'Normal',
      amountRoundingEnabled: 0,
      roundType: 'Auto',
      roundingNumber: '2',
      testRounding: '4879'
    })

    // Reset bet amount randomizer (giống SettingContext initial state)
    setRandomizerEnabled(0)
    setFromValue('100')
    setToValue('100')

    // Reset odds type settings (giống SettingContext initial state)
    context.oddsTypeSetting.setProfitMin('')
    context.oddsTypeSetting.setProfitMax('')

    // Reset game type (giống SettingContext initial state)
    context.gameType.setGameType('None')

    // Reset odds settings checkboxes và values (giống SettingContext initial state)
    setInputValuesOddsSetting({
      oddsLessThanValue: '0.10',
      oddsMoreThanValue: '0.80',
      gameCommissionMoreThanValue: '0.24',
      gameCommissionLessThanValue: '0.08'
    })

    // Reset checkboxes to initial state (all unchecked = 0)
    if (checkboxStates.oddsLessThan) setCheckboxStates('oddsLessThan')
    if (checkboxStates.oddsMoreThan) setCheckboxStates('oddsMoreThan')
    if (checkboxStates.gameCommissionMoreThan) setCheckboxStates('gameCommissionMoreThan')
    if (checkboxStates.gameCommissionLessThan) setCheckboxStates('gameCommissionLessThan')

    // Reset game type scheduler (giống SettingContext initial state - createSchedulerState())
    context.gameTypeScheduler.running.setValue(0)
    context.gameTypeScheduler.running.setInput('')
    context.gameTypeScheduler.today.setValue(0)
    context.gameTypeScheduler.today.setInput('')
    context.gameTypeScheduler.early.setValue(0)
    context.gameTypeScheduler.early.setInput('')
  }

  const handleCancel = () => {
    window.history.back()
  }

  const handleTestRounding = () => {
    const testValue = bettingModeState.testRounding
    const roundingNumber = Number(bettingModeState.roundingNumber)
    const roundType = bettingModeState.roundType

    if (!testValue || isNaN(Number(testValue))) {
      setTestResult('0')
      setShowTestResult(true)
      return
    }

    const roundedValue = calculateRoundedValue(
      Number(testValue),
      testValue,
      roundingNumber,
      roundType
    )

    setTestResult(roundedValue.toString())
    setShowTestResult(true)

    setTimeout(() => {
      setShowTestResult(false)
    }, 3000)
  }
  const effectiveBetAmount = useMemo(() => {
    const fromPercentage = Number(fromRandomizer) / 100
    const toPercentage = Number(toRandomizer) / 100

    const fromBet = Math.round(500 * fromPercentage)
    const toBet = Math.round(500 * toPercentage)

    return `$${fromBet} - $${toBet}`
  }, [fromRandomizer, toRandomizer])

  return (
    <div className="bg-layout-color flex flex-col overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)]">
      <NotificationBetAmountRandom
        title={title}
        messageError={messageError}
        showAlertDialog={showAlertMsg}
        setShowAlertDialog={setShowAlertMsg}
        actionYes={() => {
          setShowAlertMsg(false)
        }}
        ReactElement={<ExclamationTriangle className="w-28 size-11 text-[#FF8C00] mr-1" />}
      />
      <h1 className="text-lg font-bold mb-5 border-b pb-2 border-b-[#22262F]">
        Odds & Game Configuration
      </h1>
      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-[#22262F]">
        <div className="flex flex-col p-2 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Odds Type</div>
            <div className="w-1/3 flex-shrink-0">
              <div className="mb-[6px]">Odds Type</div>
              <div>
                <Select defaultValue="Malay">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Malay">Malay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-[#22262F]">
        <div className="flex flex-col space-y-6 p-2 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Profit Commission</div>
            <div className="w-1/3 flex items-center gap-2 flex-shrink-0">
              <div className="w-1/2">
                <div className="text-sm mb-[6px]">From</div>
                <InputNumber
                  precision={2}
                  min={-1}
                  max={1}
                  step={0.01}
                  allowNegative={true}
                  value={Number(context.oddsTypeSetting.profitMin)}
                  onChange={(value) => {
                    context.oddsTypeSetting.setProfitMin(value.toString())
                  }}
                />
              </div>
              <div className="w-1/2">
                <div className="text-sm mb-[6px]">To</div>
                <InputNumber
                  precision={2}
                  min={-1}
                  max={1}
                  step={0.01}
                  allowNegative={true}
                  value={Number(context.oddsTypeSetting.profitMax)}
                  onChange={(value) => {
                    context.oddsTypeSetting.setProfitMax(value.toString())
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-[#22262F]">
        <div className="flex flex-col space-y-6 p-2 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Game Type</div>
            <div className="w-1/3 flex items-center gap-2 flex-shrink-0">
              <div className="flex justify-between w-full">
                <RadioGroup
                  className="flex justify-between w-full"
                  value={context.gameType.gameType}
                  onValueChange={context.gameType.setGameType}
                >
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <RadioGroupItem value="Running" id="Running" />
                    <Label htmlFor="Running">Running</Label>
                  </div>
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <RadioGroupItem value="Today" id="Today" />
                    <Label htmlFor="Today">Today</Label>
                  </div>
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <RadioGroupItem value="Early" id="Early" />
                    <Label htmlFor="Early">Early</Label>
                  </div>
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <RadioGroupItem value="None" id="None" />
                    <Label htmlFor="None">None</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-2">
        <div className="flex flex-col space-y-6 p-2 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Game Type Scheduler</div>
            <div className="w-1/3 flex items-center gap-2 flex-shrink-0">
              <div className="flex justify-between w-full">
                <div className="flex flex-col gap-2 w-full">
                  <SchedulerItem
                    label="Running"
                    state={context.gameTypeScheduler.running}
                    id="Running_Checkbox_Scheduler"
                  />
                  <SchedulerItem
                    label="Today"
                    state={context.gameTypeScheduler.today}
                    id="Today_Checkbox_Scheduler"
                  />
                  <SchedulerItem
                    label="Early"
                    state={context.gameTypeScheduler.early}
                    id="Early_Checkbox_Scheduler"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-lg font-bold mb-5 border-b pb-2 border-b-[#22262F]">
        Betting Parameters & Randomization
      </h1>
      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-b-[#22262F]">
        <div className="flex flex-col  p-2 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">First Half</div>
            <div className="w-1/3 flex flex-wrap gap-2 flex-shrink-0">
              <div className="flex justify-between w-full">
                <label className="inline-flex items-center whitespace-nowrap">
                  <Checkbox
                    name="enable_1stHalf"
                    id="enable_1stHalf"
                    checked={Boolean(context.firstHalf.firstHalfState.enableFirstStHalf)}
                    onCheckedChange={() =>
                      setFirstHalfState({
                        enableFirstStHalf: Number(
                          !context.firstHalf.firstHalfState.enableFirstStHalf
                        )
                      })
                    }
                  />
                  <span className="ml-2">Bet 0-45 minutes</span>
                </label>

                <label className="inline-flex items-center whitespace-nowrap">
                  <Checkbox
                    name="bet_first_half"
                    id="bet_first_half"
                    disabled={!context.firstHalf.firstHalfState.enableFirstStHalf}
                    checked={Boolean(context.firstHalf.firstHalfState.betFirstHalf)}
                    onCheckedChange={() =>
                      setFirstHalfState({
                        betFirstHalf: Number(!context.firstHalf.firstHalfState.betFirstHalf)
                      })
                    }
                  />
                  <span className="ml-2">Bet first half</span>
                </label>

                <label className="inline-flex items-center whitespace-nowrap">
                  <Checkbox
                    name="bet_full_time"
                    id="bet_full_time"
                    disabled={!context.firstHalf.firstHalfState.enableFirstStHalf}
                    checked={Boolean(context.firstHalf.firstHalfState.betFullTime)}
                    onCheckedChange={() =>
                      setFirstHalfState({
                        betFullTime: Number(!context.firstHalf.firstHalfState.betFullTime)
                      })
                    }
                  />
                  <span className="ml-2">Bet full time</span>
                </label>
              </div>
              <div className="flex w-full gap-2 mt-2">
                <div className="w-full">
                  <div className="text-sm mb-1 whitespace-nowrap">Betting from (minutes)</div>

                  <InputNumber
                    precision={0}
                    min={0}
                    max={45}
                    step={1}
                    value={Number(context.firstHalf.firstHalfState.firstStHalfBettingForm)}
                    onChange={(value) => {
                      context.firstHalf.setFirstHalfState({ firstStHalfBettingForm: String(value) })
                    }}
                  />
                </div>

                <div className="w-full">
                  <div className="text-sm mb-1 whitespace-nowrap">to (minutes)</div>
                  <InputNumber
                    precision={0}
                    min={0}
                    max={45}
                    step={1}
                    value={Number(context.firstHalf.firstHalfState.firstStHalfBettingUntil)}
                    onChange={(value) => {
                      context.firstHalf.setFirstHalfState({
                        firstStHalfBettingUntil: String(value)
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-b-[#22262F]">
        <div className="flex flex-col space-y-6 p-2 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Second Half</div>
            <div className="w-1/3 flex flex-wrap gap-2 flex-shrink-0">
              <div className="flex w-full">
                <label className="inline-flex items-center w-[232px] flex-shrink-0 whitespace-nowrap">
                  <Checkbox
                    name="enable_2stHalf"
                    id="enable_2stHalf"
                    checked={Boolean(context.secondHalf.secondHalfState.enableSecondStHalf)}
                    onCheckedChange={() =>
                      setSecondHalfState({
                        enableSecondStHalf: Number(
                          !context.secondHalf.secondHalfState.enableSecondStHalf
                        )
                      })
                    }
                  />
                  <span className="ml-2">Bet 46 - 90 Minutes</span>
                </label>

                <label className="inline-flex items-center whitespace-nowrap">
                  <Checkbox
                    name="bet_second_half"
                    id="bet_second_half"
                    checked={Boolean(context.secondHalf.secondHalfState.betHalfTime)}
                    onCheckedChange={() =>
                      setSecondHalfState({
                        betHalfTime: Number(!context.secondHalf.secondHalfState.betHalfTime)
                      })
                    }
                  />
                  <span className="ml-2">Bet Half Time</span>
                </label>
              </div>
              <div className="flex w-full gap-2 mt-2">
                <div className="w-full">
                  <div className="text-sm mb-1 whitespace-nowrap">Betting from (minutes)</div>

                  <InputNumber
                    precision={0}
                    min={46}
                    max={90}
                    step={1}
                    disabled={!secondHalfState.enableSecondStHalf}
                    value={Number(context.secondHalf.secondHalfState.secondStHalfBettingForm)}
                    onChange={(value) => {
                      context.secondHalf.setSecondHalfState({
                        secondStHalfBettingForm: String(value)
                      })
                    }}
                  />
                </div>

                <div className="w-full">
                  <div className="text-sm mb-1 whitespace-nowrap">to (minutes)</div>
                  <InputNumber
                    precision={0}
                    min={46}
                    max={90}
                    step={1}
                    disabled={!secondHalfState.enableSecondStHalf}
                    value={Number(context.secondHalf.secondHalfState.secondStHalfBettingUntil)}
                    onChange={(value) => {
                      context.secondHalf.setSecondHalfState({
                        secondStHalfBettingUntil: String(value)
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-b-[#22262F]">
        <div className="flex flex-col space-y-6 p-2 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Amount Rounding</div>
            <div className="w-1/3 flex flex-wrap gap-2 flex-shrink-0">
              <div className="flex items-center gap-2 w-full">
                <SwitchCustom
                  onCheckedChange={() =>
                    setBettingModeState({
                      amountRoundingEnabled: Number(!bettingModeState.amountRoundingEnabled)
                    })
                  }
                  checked={Boolean(bettingModeState.amountRoundingEnabled)}
                />
                <span className="text-base font-medium">Enable</span>
              </div>

              <div className="flex w-full pt-2">
                <div className="flex justify-between w-full">
                  <RadioGroup
                    value={bettingModeState.roundType}
                    onValueChange={(value) => {
                      setBettingModeState({ roundType: value })
                    }}
                    className="flex justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="roundDown" id="roundDown" />
                      <label htmlFor="roundDown" className="text-sm font-medium whitespace-nowrap">
                        Round Down
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="roundUp" id="roundUp" />
                      <label htmlFor="roundUp" className="text-sm font-medium whitespace-nowrap">
                        Round Up
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="Auto" id="Auto" />
                      <label htmlFor="Auto" className="text-sm font-medium whitespace-nowrap">
                        Auto
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex w-full gap-2 mt-2">
                <div className="w-1/2">
                  <div className="text-sm mb-1 whitespace-nowrap">Rounding Number</div>
                  <InputNumber
                    precision={0}
                    min={1}
                    max={8}
                    step={1}
                    disabled={!bettingModeState.amountRoundingEnabled}
                    value={Number(bettingModeState.roundingNumber)}
                    onChange={(value) => {
                      setBettingModeState({ roundingNumber: String(value) })
                    }}
                  />
                </div>

                <div className="w-1/2">
                  <div className="text-sm mb-1 whitespace-nowrap">Test Rounding</div>
                  <div className="relative">
                    <Input
                      disabled={!bettingModeState.amountRoundingEnabled}
                      value={bettingModeState.testRounding}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^\d*$/.test(value)) {
                          setBettingModeState({ testRounding: value })
                        }
                      }}
                      button={{
                        text: 'Test',
                        onClick: handleTestRounding
                      }}
                    />
                    {showTestResult && (
                      <div className="absolute top-full left-0 mt-1 bg-blue-100 border border-blue-300 rounded px-2 py-1 text-sm text-blue-800">
                        Result: {testResult}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-b-[#22262F]">
        <div className="flex flex-col space-y-6 p-2 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Odds Settings</div>
            <div className="w-1/3 flex flex-wrap gap-2 flex-shrink-0">
              <div className="flex w-full items-center">
                <div className="flex gap-2 w-[400px] items-center flex-shrink-0">
                  <Checkbox
                    id="oddsLessThan"
                    onCheckedChange={() => setCheckboxStates('oddsLessThan')}
                    checked={Boolean(checkboxStates.oddsLessThan)}
                  />

                  <label htmlFor="oddsLessThan" className="cursor-pointer whitespace-nowrap">
                    Don&apos;t Bet when odds &lt;
                  </label>
                </div>
                <div className="w-40 flex-shrink-0">
                  <InputNumber
                    disabled={!checkboxStates.oddsLessThan}
                    precision={2}
                    step={0.01}
                    min={-1.0}
                    max={1.0}
                    value={Number(inputValuesOddsSetting.oddsLessThanValue)}
                    onChange={(value) =>
                      setInputValuesOddsSetting({
                        oddsLessThanValue: Number(value)
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex w-full items-center">
                <div className="flex gap-2 w-[400px] items-center flex-shrink-0">
                  <Checkbox
                    id="oddsMoreThan"
                    onCheckedChange={() => setCheckboxStates('oddsMoreThan')}
                    checked={Boolean(checkboxStates.oddsMoreThan)}
                  />

                  <label htmlFor="oddsMoreThan" className="cursor-pointer whitespace-nowrap">
                    Don&apos;t Bet when odds &gt;
                  </label>
                </div>
                <div className="w-40 flex-shrink-0">
                  <InputNumber
                    disabled={!checkboxStates.oddsMoreThan}
                    precision={2}
                    step={0.01}
                    min={-1.0}
                    max={1.0}
                    value={Number(inputValuesOddsSetting.oddsMoreThanValue)}
                    onChange={(value) =>
                      setInputValuesOddsSetting({
                        oddsMoreThanValue: Number(value)
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex w-full items-center">
                <div className="flex gap-2 w-[400px] items-center flex-shrink-0">
                  <Checkbox
                    id="gameCommissionMoreThan"
                    onCheckedChange={() => setCheckboxStates('gameCommissionMoreThan')}
                    checked={Boolean(checkboxStates.gameCommissionMoreThan)}
                  />

                  <label
                    htmlFor="gameCommissionMoreThan"
                    className="cursor-pointer whitespace-nowrap"
                  >
                    Don&apos;t Bet when Game Commission &gt;
                  </label>
                </div>
                <div className="w-40 flex-shrink-0">
                  <InputNumber
                    disabled={!checkboxStates.gameCommissionMoreThan}
                    precision={2}
                    step={0.01}
                    min={-1.0}
                    max={1.0}
                    value={Number(inputValuesOddsSetting.gameCommissionMoreThanValue)}
                    onChange={(value) =>
                      setInputValuesOddsSetting({
                        gameCommissionMoreThanValue: Number(value)
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex w-full items-center">
                <div className="flex gap-2 w-[400px] items-center flex-shrink-0">
                  <Checkbox
                    id="gameCommissionLessThan"
                    onCheckedChange={() => setCheckboxStates('gameCommissionLessThan')}
                    checked={Boolean(checkboxStates.gameCommissionLessThan)}
                  />

                  <label
                    htmlFor="gameCommissionLessThan"
                    className="cursor-pointer whitespace-nowrap"
                  >
                    Don&apos;t Bet when Game Commission &lt;
                  </label>
                </div>
                <div className="w-40 flex-shrink-0">
                  <InputNumber
                    disabled={!checkboxStates.gameCommissionLessThan}
                    precision={2}
                    step={0.01}
                    min={-1.0}
                    max={1.0}
                    value={Number(inputValuesOddsSetting.gameCommissionLessThanValue)}
                    onChange={(value) =>
                      setInputValuesOddsSetting({
                        gameCommissionLessThanValue: Number(value)
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-b-[#22262F]">
        <div className="flex flex-col space-y-6 p-2 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Bet Amount Randomizer</div>
            <div className="w-1/3 flex flex-wrap gap-2 flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <SwitchCustom
                    checked={Boolean(enableRandomizer)}
                    onCheckedChange={() => setRandomizerEnabled(Number(!enableRandomizer))}
                  />
                  <span className="text-base font-medium">Enable</span>
                </div>
                <div className="text-[#94979C] font-normal text-sm whitespace-nowrap">
                  Effective bet amount (e.g. $500)
                </div>
              </div>

              <div className="flex w-full gap-2 mt-2">
                <div className="w-full">
                  <div className="text-sm mb-1 text-[#CECFD2] font-medium whitespace-nowrap">
                    From (0% - 100%)
                  </div>
                  <InputNumber
                    precision={0}
                    min={0}
                    max={100}
                    step={1}
                    disabled={!enableRandomizer}
                    value={Number(fromRandomizer)}
                    onChange={(value) => {
                      setFromValue(String(value))
                    }}
                  />
                </div>

                <div className="w-full">
                  <div className="text-sm mb-1 text-[#CECFD2] font-medium whitespace-nowrap">
                    to (100% - 200%)
                  </div>
                  <InputNumber
                    precision={0}
                    min={100}
                    max={200}
                    step={1}
                    disabled={!enableRandomizer}
                    value={Number(toRandomizer)}
                    onChange={(value) => {
                      setToValue(String(value))
                    }}
                  />
                </div>
              </div>

              <div className="w-full">
                <div className="text-sm mb-1 text-[#CECFD2] font-medium whitespace-nowrap">
                  Calculated Effective Bet Amount
                </div>
                <div
                  className={`text-sm font-medium p-2 rounded border-[#373A41] bg-[#13161B] ${
                    enableRandomizer ? 'text-white  ' : 'text-gray-600 '
                  }`}
                >
                  {effectiveBetAmount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4 py-5 pr-5">
        <Button
          variant="plain-white"
          size="sm"
          className="text-white whitespace-nowrap"
          onClick={handleResetAllChanges}
        >
          Reset all changes
        </Button>
        <Button
          variant="bordered-white"
          size="sm"
          className="border-red whitespace-nowrap"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button size="sm" onClick={handleSaveSetting} className="whitespace-nowrap">
          Save
        </Button>
      </div>
      {showSaveSuccess && (
        <div className="fixed top-[5%] right-[2%] bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-pulse">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{messageSuccess}</span>
        </div>
      )}
    </div>
  )
}
