import { useContext, useState } from 'react'
import { CheckCircle } from 'lucide-react'

import { SettingContext } from '@renderer/context/SettingContext'
import { calculateRoundedValue } from '@renderer/lib/calculateRoundedValue'
import { checkInputFormatScheduler } from '@renderer/lib/checkInputFormatScheduler'
import { validateBettingFields } from '@renderer/lib/utils'
import { TEXT_MESSAGE_ERROR_DEFAULT, VALUE_DEFAULT_ODDS_SETTING } from '@shared/renderer/constants'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { InputNumber } from '../ui/input-number'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { NotificationBetAmountRandom } from '@renderer/components/Setting/ButtonSaveSettings/NotificationBetAmountRandom'

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
      <h1 className="text-lg font-bold mb-5 border-b pb-2 mt-8 border-b-[#22262F]">
        Game Configuration
      </h1>
      <div className="grid grid-cols-1 gap-2 mb-2 border-b border-[#22262F]">
        <div className="flex flex-col p-4 pl-0">
          <div className="flex">
            <div className="w-1/3 flex-shrink-0">Odds Type</div>
            <div className="w-1/3 flex-shrink-0">
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
        <div className="flex flex-col space-y-6 p-4 pl-0">
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
        <div className="flex flex-col space-y-6 p-4 pl-0">
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

      <div className="flex justify-end space-x-2 mt-4 py-5 pr-5">
        <Button
          variant="bordered-white"
          className="border-red whitespace-nowrap w-28"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button onClick={handleSaveSetting} className="whitespace-nowrap w-28">
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
