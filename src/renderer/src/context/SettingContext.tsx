import { SettingType } from '@shared/common/types'
import { createContext, SetStateAction, useEffect, useState } from 'react'

interface SchedulerState {
  value: number
  setValue: (value: number) => void
  input: string
  setInput: (value: string) => void
}

interface FirstHalfState {
  enableFirstStHalf: number
  betFirstHalf: number
  betFullTime: number
  firstStHalfBettingForm: string
  firstStHalfBettingUntil: string
}

interface SecondHalfState {
  enableSecondStHalf: number
  betHalfTime: number
  secondStHalfBettingForm: string
  secondStHalfBettingUntil: string
}

export interface BettingModeState {
  bettingMode: string
  amountRoundingEnabled: number
  roundType: string
  roundingNumber: string
  testRounding: string
}

interface SchedulerContextType {
  oddsTypeSetting: {
    profitMin: string
    setProfitMin: (value: string) => void
    profitMax: string
    setProfitMax: (value: string) => void
  }
  gameType: { gameType: string; setGameType: (value: string) => void }
  gameTypeScheduler: {
    running: SchedulerState
    today: SchedulerState
    early: SchedulerState
  }
  firstHalf: {
    firstHalfState: FirstHalfState
    setFirstHalfState: (value: Partial<FirstHalfState>) => void
  }
  secondHalf: {
    secondHalfState: SecondHalfState
    setSecondHalfState: (value: Partial<SecondHalfState>) => void
  }
  bettingMode: {
    bettingModeState: BettingModeState
    setBettingModeState: (value: Partial<BettingModeState>) => void
  }
  oddsSetting: {
    checkboxStates: {
      oddsLessThan: number
      oddsMoreThan: number
      gameCommissionMoreThan: number
      gameCommissionLessThan: number
    }
    setCheckboxStates: (key: string) => void
    inputValuesOddsSetting: {
      oddsLessThanValue: string
      oddsMoreThanValue: string
      gameCommissionMoreThanValue: string
      gameCommissionLessThanValue: string
    }
    setInputValuesOddsSetting: (value) => void
  }
  betAmountRandom: {
    enableRandomizer: number
    setRandomizerEnabled: (value: SetStateAction<number>) => void
    fromRandomizer: string
    setFromValue: (value: string) => void
    toRandomizer: string
    setToValue: (value: string) => void
  }
}

const createSchedulerState = (initialValue = 0, initialInput = '') => {
  const [value, setValue] = useState(initialValue)
  const [input, setInput] = useState(initialInput)
  return { value, setValue, input, setInput }
}

export const SettingContext = createContext<SchedulerContextType | undefined>(undefined)

export const SettingProvider = ({ children }) => {
  const [profitMin, setProfitMin] = useState<string>('')
  const [profitMax, setProfitMax] = useState<string>('')
  const [gameType, setGameType] = useState<string>('None')

  const [firstHalfState, setFirstHalfState] = useState<FirstHalfState>({
    enableFirstStHalf: 1,
    betFirstHalf: 1,
    betFullTime: 1,
    firstStHalfBettingForm: '0',
    firstStHalfBettingUntil: '45'
  })

  const [secondHalfState, setSecondHalfState] = useState<SecondHalfState>({
    enableSecondStHalf: 1,
    betHalfTime: 1,
    secondStHalfBettingForm: '46',
    secondStHalfBettingUntil: '90'
  })

  const [bettingModeState, setBettingModeState] = useState<BettingModeState>({
    bettingMode: 'Normal',
    amountRoundingEnabled: 0,
    roundType: 'Auto',
    roundingNumber: '2',
    testRounding: '4879'
  })

  const [checkboxStates, setCheckboxStates] = useState({
    oddsLessThan: 0,
    oddsMoreThan: 0,
    gameCommissionMoreThan: 0,
    gameCommissionLessThan: 0
  })

  const [inputValuesOddsSetting, setInputValuesOddsSetting] = useState({
    oddsLessThanValue: '0.10',
    oddsMoreThanValue: '0.80',
    gameCommissionMoreThanValue: '0.24',
    gameCommissionLessThanValue: '0.08'
  })

  const [enableRandomizer, setRandomizerEnabled] = useState<number>(0)
  const [fromRandomizer, setFromValue] = useState<string>('100')
  const [toRandomizer, setToValue] = useState<string>('100')

  const running = createSchedulerState()
  const today = createSchedulerState()
  const early = createSchedulerState()

  useEffect(() => {
    const fetchData = async () => {
      const data = (await window.electron.ipcRenderer.invoke('GetDataSetting')) as SettingType[]

      if (data.length > 0) {
        const settings = data[0]
        setProfitMin(settings.profitMin)
        setProfitMax(settings.profitMax)
        setGameType(settings.gameType)
        running.setValue(settings.schedulerRunning)
        running.setInput(settings.schedulerInputRunning)
        today.setValue(settings.schedulerToday)
        today.setInput(settings.schedulerInputToday)
        early.setValue(settings.schedulerEarly)
        early.setInput(settings.schedulerInputEarly)
        setFirstHalfState((prev) => ({
          ...prev,
          enableFirstStHalf: settings.enableFirstStHalf,
          betFirstHalf: settings.betFirstHalf,
          betFullTime: settings.betFullTime,
          firstStHalfBettingForm: settings.firstStHalfBettingForm,
          firstStHalfBettingUntil: settings.firstStHalfBettingUntil
        }))
        setSecondHalfState((prev) => ({
          ...prev,
          enableSecondStHalf: settings.enableSecondStHalf,
          betHalfTime: settings.betHalfTime,
          secondStHalfBettingForm: settings.secondStHalfBettingForm,
          secondStHalfBettingUntil: settings.secondStHalfBettingUntil
        }))
        setBettingModeState((prev) => ({
          ...prev,
          bettingMode: settings.bettingMode,
          amountRoundingEnabled: settings.amountRoundingEnabled,
          roundType: settings.roundType,
          roundingNumber: settings.roundingNumber
        }))
        setCheckboxStates({
          oddsLessThan: settings.oddsLessThan,
          oddsMoreThan: settings.oddsMoreThan,
          gameCommissionMoreThan: settings.gameCommissionMoreThan,
          gameCommissionLessThan: settings.gameCommissionLessThan
        })
        setInputValuesOddsSetting({
          oddsLessThanValue: settings.oddsLessThanValue,
          oddsMoreThanValue: settings.oddsMoreThanValue,
          gameCommissionMoreThanValue: settings.gameCommissionMoreThanValue,
          gameCommissionLessThanValue: settings.gameCommissionLessThanValue
        })
        setRandomizerEnabled(settings.enableRandomizer)
        setFromValue(settings.fromRandomizer)
        setToValue(settings.toRandomizer)
      }
    }

    fetchData()

    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetDataSetting')
    }
  }, [])

  const contextValue: SchedulerContextType = {
    oddsTypeSetting: { profitMin, setProfitMin, profitMax, setProfitMax },
    gameType: { gameType, setGameType },
    gameTypeScheduler: {
      running,
      today,
      early
    },
    firstHalf: {
      firstHalfState,
      setFirstHalfState: (value) => setFirstHalfState((prev) => ({ ...prev, ...value }))
    },
    secondHalf: {
      secondHalfState,
      setSecondHalfState: (value) => setSecondHalfState((prev) => ({ ...prev, ...value }))
    },
    bettingMode: {
      bettingModeState,
      setBettingModeState: (value) => setBettingModeState((prev) => ({ ...prev, ...value }))
    },
    oddsSetting: {
      checkboxStates,
      setCheckboxStates: (key) =>
        setCheckboxStates((prev) => ({ ...prev, [key]: Number(!prev[key]) })),
      inputValuesOddsSetting,
      setInputValuesOddsSetting: (value) =>
        setInputValuesOddsSetting((prev) => ({ ...prev, ...value }))
    },
    betAmountRandom: {
      enableRandomizer,
      setRandomizerEnabled,
      fromRandomizer,
      setFromValue,
      toRandomizer,
      setToValue
    }
  }

  return <SettingContext.Provider value={contextValue}>{children}</SettingContext.Provider>
}
