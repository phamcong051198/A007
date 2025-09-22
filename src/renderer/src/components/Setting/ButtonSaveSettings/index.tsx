import { NotificationBetAmountRandom } from '@renderer/components/Setting/ButtonSaveSettings/NotificationBetAmountRandom'
import { Button } from '@renderer/components/ui/button'
import { SettingContext } from '@renderer/context/SettingContext'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import { checkInputFormatScheduler } from '@renderer/lib/checkInputFormatScheduler'
import { validateBettingFields } from '@renderer/lib/utils'
import { TEXT_MESSAGE_ERROR_DEFAULT, VALUE_DEFAULT_ODDS_SETTING } from '@shared/renderer/constants'
import React, { useContext, useState } from 'react'

const ButtonSaveSettings = () => {
  const context = useContext(SettingContext)
  if (!context) return null

  const { gameType } = context.gameType
  const { profitMin, profitMax } = context.oddsTypeSetting
  const { checkboxStates, inputValuesOddsSetting, setInputValuesOddsSetting } = context.oddsSetting
  const { running, today, early } = context.gameTypeScheduler
  const { firstHalfState } = context.firstHalf
  const { secondHalfState } = context.secondHalf
  const { bettingModeState } = context.bettingMode
  const { enableRandomizer, fromRandomizer, setFromValue, toRandomizer, setToValue } =
    context.betAmountRandom

  const [title, setTitle] = useState('Notification')
  const [messageError, setMessageError] = useState('')
  const [showAlertMsg, setShowAlertMsg] = useState(false)

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

    if (
      !fromRandomizer ||
      fromRandomizer == '' ||
      Number(fromRandomizer) < 0 ||
      Number(fromRandomizer) > 100
    ) {
      setFromValue('100')

      setTitle('Notification Bet Amount Randomizer')
      setMessageError('The From value must be between 0%-100%')
      setShowAlertMsg(true)
      return
    }

    if (
      !toRandomizer ||
      toRandomizer == '' ||
      Number(toRandomizer) < 100 ||
      Number(toRandomizer) > 200
    ) {
      setToValue('100')
      setTitle('Notification Bet Amount Randomizer')
      setMessageError('The To value must be between 100%-200%')
      setShowAlertMsg(true)
      return
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
        isNaN(parseFloat(profitMin as string)) || parseFloat(profitMin as string) < -1
          ? '-1'
          : profitMin,
      profitMax:
        isNaN(parseFloat(profitMax as string)) || parseFloat(profitMax as string) > 1
          ? '1'
          : profitMax,
      gameType,
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
      schedulerRunning: running.value,
      schedulerInputRunning: checkInputFormatScheduler(running.input),
      schedulerToday: today.value,
      schedulerInputToday: checkInputFormatScheduler(today.input),
      schedulerEarly: early.value,
      schedulerInputEarly: checkInputFormatScheduler(early.input)
    })
  }
  return (
    <div>
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
      <Button
        variant="outline"
        className=" border  border-solid  border-gray-400 hover:border-blue-500 py-0 px-8 leading-none h-[24px] font-bold w-24"
        onClick={handleSaveSetting}
      >
        Save
      </Button>
    </div>
  )
}

export default React.memo(ButtonSaveSettings)
