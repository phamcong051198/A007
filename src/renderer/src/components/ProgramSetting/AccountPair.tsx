import BetTo from '@renderer/components/AccountPair/BetSetting/DetailedSetting/BetTo'
import GameRange from '@renderer/components/AccountPair/BetSetting/DetailedSetting/GameRange'
import { AccountPairContext, AccountPairProvider } from '@renderer/context/AccountPairContext'
import { generateAccountData } from '@renderer/lib/generateAccountData'
import { generateAddAllAccountPair } from '@renderer/lib/generateAddAllAccountPair'
import { getBetText } from '@renderer/lib/getBetText'
import { sanitizeAccountsData } from '@renderer/lib/sanitizeAccountsData'
import { AccountPairType } from '@shared/common/types'
import { CHECK_BOX_DETAIL_SETTING } from '@shared/renderer/constants'
import { AccountType } from '@shared/common/types'
import { CheckCircle } from 'lucide-react'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Checkbox } from '../ui/checkbox'
import { InputNumber } from '../ui/input-number'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import AmountRounding from './components/AmountRounding'
// import LineRangeSettingsModal from './modal/LineRangeSettingsModal'
import { Confirmation } from '@renderer/components/NotificationPopup/Confirmation'
import { NotificationError } from '@renderer/components/NotificationPopup/NotificationError'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import QuestionMarkCircle from '@renderer/icons/question-mark-circle'
import { Button } from '../ui/button'
import LineRangeSettingsModal from './modal/LineRangeSettingsModal'
import QuickAmountRounderSettingModal from './modal/QuickAmountRounderSettingModal'
import QuickAmountSettingModal from './modal/QuickAmountSettingModal'
import QuickBetTargetSettingModal from './modal/QuickBetTargetSettingModal'
import QuickOddsRangeSettingModal from './modal/QuickOddsRangeSettingModal'
import { getThemeClass } from '@shared/common/constants'
import AddSelectedAccountPairModal from '@renderer/windows/AddSelectedAccountPair'

// Create context for account selection
const AccountSelectionContext = React.createContext<{
  account1: AccountType | undefined
  account2: AccountType | undefined
  setAccount1: (account: AccountType) => void
  setAccount2: (account: AccountType) => void
}>({
  account1: undefined,
  account2: undefined,
  setAccount1: () => {},
  setAccount2: () => {}
})

// Component hiển thị Account 1 list
const Account1List = () => {
  const context = useContext(AccountPairContext)
  const selectionContext = useContext(AccountSelectionContext)
  const { listAccount } = context.ListAccount

  const handleSelectAccount = (account: AccountType) => {
    selectionContext.setAccount1(account)
  }

  return (
    <div className="w-1/2 bg-[#0C0E12] rounded-lg border-t border-r border-l border-[#22262F] overflow-hidden rounded-r-none">
      {/* Header */}
      <div className="px-4 py-2 bg-[#0C0E12] text-gray-200 font-semibold border-b border-[#22262F]">
        Account 1
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-80">
        {listAccount.map((account) => (
          <div
            key={account.id}
            className={`px-4 py-2 text-gray-300 border-b border-[#22262F] hover:${getThemeClass('bg')} cursor-pointer transition-colors ${
              selectionContext.account1?.id === account.id ? getThemeClass('bg') : ''
            }`}
            onClick={() => handleSelectAccount(account)}
          >
            {account.platformName}-{account.loginID}
          </div>
        ))}
        {listAccount.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">No accounts available</div>
        )}
      </div>
    </div>
  )
}

// Component hiển thị Account 2 list
const Account2List = () => {
  const context = useContext(AccountPairContext)
  const selectionContext = useContext(AccountSelectionContext)
  const { listAccount } = context.ListAccount

  const handleSelectAccount = (account: AccountType) => {
    selectionContext.setAccount2(account)
  }

  return (
    <div className="w-1/2 bg-[#0C0E12] rounded-lg border-t border-r border-l-0 border-[#22262F] overflow-hidden rounded-l-none">
      {/* Header */}
      <div className="px-4 py-2 bg-[#0C0E12] font-semibold border-b border-[#22262F]">
        Account 2
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-80">
        {listAccount.map((account) => (
          <div
            key={account.id}
            className={`px-4 py-2 text-gray-300 border-b border-[#22262F] hover:${getThemeClass('bg')} cursor-pointer transition-colors ${
              selectionContext.account2?.id === account.id ? getThemeClass('bg') : ''
            }`}
            onClick={() => handleSelectAccount(account)}
          >
            {account.platformName}-{account.loginID}
          </div>
        ))}
        {listAccount.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">No accounts available</div>
        )}
      </div>
    </div>
  )
}

const CombinationsList = () => {
  const context = useContext(AccountPairContext)
  const { listAccountPair, currentAccountPair, setCurrentAccountPair } = context.Combination

  const containerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleSelectAccountPair = (accountPair: AccountPairType) => {
    setCurrentAccountPair(accountPair)
  }

  const moveSelection = useCallback(
    (direction: 'prev' | 'next') => {
      const index = listAccountPair.findIndex((pair) => pair.id === currentAccountPair.id)
      if (index === -1) return

      let newIndex = index
      if (direction === 'prev' && index > 0) {
        newIndex = index - 1
      } else if (direction === 'next' && index < listAccountPair.length - 1) {
        newIndex = index + 1
      }

      if (newIndex !== index) {
        setCurrentAccountPair(listAccountPair[newIndex])
      }
    },
    [listAccountPair, currentAccountPair, setCurrentAccountPair]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault()
        moveSelection('prev')
      } else if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        moveSelection('next')
      }
    }

    if (isFocused) {
      window.addEventListener('keydown', handleKeyDown)
    } else {
      window.removeEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFocused, moveSelection])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        setIsFocused(true)
      } else {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="bg-[#0C0E12] rounded-lg border border-[#22262F] overflow-hidden h-[500px]"
    >
      {/* Header */}
      <div className="px-4 py-2 bg-[#0C0E12] text-gray-200 font-semibold border-b border-[#22262F]">
        Combination(s)
      </div>

      {/* List */}
      <div className="overflow-y-auto h-[500px] ">
        {listAccountPair.map((accountPair) => (
          <div
            key={accountPair.id}
            className={`px-4 py-2 text-gray-300 border-b border-[#22262F] hover:${getThemeClass('bg')} cursor-pointer transition-colors flex justify-between items-center ${
              currentAccountPair.id === accountPair.id ? getThemeClass('bg') : ''
            }`}
            onClick={() => handleSelectAccountPair(accountPair)}
          >
            <div className="flex w-[90%] items-center ">
              <div className="flex items-center gap-2 w-1/3">
                <span className="text-white ">{accountPair.account1.platform}</span>
                <div className="text-xs text-white">{accountPair.account1.loginID}</div>
              </div>
              <div className="mx-2 text-gray-500 w-1/3 text-center">vs.</div>
              <div className="flex items-center gap-2 w-1/3">
                <span className="text-white">{accountPair.account2.platform}</span>
                <div className="text-xs text-white">{accountPair.account2.loginID}</div>
              </div>
            </div>
          </div>
        ))}

        {listAccountPair.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">No combinations available</div>
        )}
      </div>
    </div>
  )
}

const ActionButtons = ({ setShowSaveSuccess, setMessageSuccess, openAddSelectionModal }) => {
  const context = useContext(AccountPairContext)
  const selectionContext = useContext(AccountSelectionContext)
  const { listAccountPair, setListAccountPair, setCurrentAccountPair, currentAccountPair } =
    context.Combination
  const { listAccount, setListAccount } = context.ListAccount
  const { setIsClearInvalidAccount } = context.ClearInvalidAccount

  // State cho notifications
  const [title, setTitle] = useState('Error')
  const [messageError, setMessageError] = useState('')
  const [showAlertError, setShowAlertError] = useState(false)
  const [showAlertMsg, setShowAlertMsg] = useState(false)
  const [actionYes, setActionYes] = useState<() => void>(() => {})

  const addAccountPair = useCallback(async () => {
    if (!selectionContext.account1 || !selectionContext.account2) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    const [firstAccount, secondAccount] = [
      selectionContext.account1,
      selectionContext.account2
    ].sort((a, b) =>
      a.platformName === b.platformName ? a.id - b.id : a.platformName.localeCompare(b.platformName)
    )

    const id1 = firstAccount.id
    const id2 = secondAccount.id

    const isPairExist = listAccountPair.some(
      ({ account1, account2 }) =>
        (account1.id === id1 && account2.id === id2) || (account1.id === id2 && account2.id === id1)
    )

    if (isPairExist) {
      setMessageError('This account pair already exists')
      setShowAlertError(true)
      return
    }

    const accountPair = {
      id: uuidv4() as string,
      isValid: 0,
      key: '',
      account1: generateAccountData(firstAccount),
      account2: generateAccountData(secondAccount)
    }

    accountPair.isValid = accountPair.account1.platform === accountPair.account2.platform ? 0 : 1
    accountPair.key = `${accountPair.account1.platform}_${accountPair.account2.platform}`

    setListAccountPair([...listAccountPair, accountPair])
    setCurrentAccountPair(accountPair)
  }, [
    selectionContext.account1,
    selectionContext.account2,
    listAccountPair,
    setListAccountPair,
    setCurrentAccountPair
  ])

  const showConfirmation = useCallback(
    (title: string, message: string, actionYesCallback: () => void) => {
      setTitle(title)
      setMessageError(message)
      setShowAlertMsg(true)
      setActionYes(() => actionYesCallback)
    },
    []
  )

  const addAllCombinations = useCallback(() => {
    if (!listAccount.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    showConfirmation('Confirmation', 'Add all combinations?', () => {
      const allPairs = generateAddAllAccountPair(listAccount)
      setListAccountPair(allPairs)
      setCurrentAccountPair(allPairs[0])
      setShowAlertMsg(false)
      showToast('All combinations added successfully!')
    })
  }, [listAccount, showConfirmation, setListAccountPair, setCurrentAccountPair])

  const addSelection = () => {
    console.log('test')
    openAddSelectionModal()
  }

  const clearInvalidAccounts = useCallback(() => {
    showConfirmation('Confirmation', 'Confirm to clear invalid account(s)?', () => {
      setIsClearInvalidAccount()
      const validAccounts = listAccount.filter((account) => account.statusDelete === 0)
      const dataIds = new Set(validAccounts.map((validAccount) => validAccount.id))
      const validCombination = listAccountPair.filter(
        (item) => dataIds.has(item.account1.id) && dataIds.has(item.account2.id)
      )
      setListAccount(validAccounts)
      setListAccountPair(validCombination)
      setShowAlertMsg(false)
      showToast('Invalid accounts cleared successfully!')
    })
  }, [
    showConfirmation,
    setIsClearInvalidAccount,
    listAccount,
    listAccountPair,
    setListAccount,
    setListAccountPair
  ])

  const removeAllCombinations = useCallback(() => {
    if (!listAccountPair.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    showConfirmation('Confirmation', 'Delete all combinations?', () => {
      setListAccountPair([])
      setCurrentAccountPair({} as AccountPairType)
      setShowAlertMsg(false)
      showToast('All combinations removed successfully!')
    })
  }, [listAccountPair, showConfirmation, setListAccountPair, setCurrentAccountPair])

  const removeCombination = useCallback(() => {
    if (!listAccountPair.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    showConfirmation('Confirmation', 'Delete selected combinations?', () => {
      setShowAlertMsg(false)
      setListAccountPair(
        listAccountPair.filter((accountPair) => accountPair.id !== currentAccountPair.id)
      )
      const updatedPairs = listAccountPair.filter((pair) => pair.id !== currentAccountPair.id)
      if (updatedPairs.length > 0) {
        setCurrentAccountPair(updatedPairs[0])
      } else {
        setCurrentAccountPair({} as AccountPairType)
      }
      showToast('Combination removed successfully!')
    })
  }, [
    listAccountPair,
    currentAccountPair,
    showConfirmation,
    setListAccountPair,
    setCurrentAccountPair
  ])
  const showToast = (message: string) => {
    setShowSaveSuccess(true)
    setMessageSuccess(message)
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 2000)
  }
  return (
    <>
      <div className="flex gap-2 bg-[#13161B] py-4 mb-4 items-center justify-between rounded-lg">
        <div className="flex gap-4 items-center">
          <Button className="whitespace-nowrap" onClick={addAccountPair}>
            Add combination
          </Button>
          <Button
            className="whitespace-nowrap"
            onClick={addAllCombinations}
            variant="bordered-white"
          >
            Add all combinations
          </Button>

          <div
            onClick={addSelection}
            className="text-[##ECFD2] whitespace-nowrap font-semibold cursor-pointer"
          >
            Add selection
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            onClick={clearInvalidAccounts}
            className="text-[#F97066] font-semibold cursor-pointer whitespace-nowrap"
          >
            Clear invalid account(s)
          </div>
          <Button
            onClick={removeAllCombinations}
            variant="bordered-white"
            className="text-[#F97066] border-[#F97066] whitespace-nowrap"
          >
            Remove all combinations
          </Button>
          <Button className="whitespace-nowrap" onClick={removeCombination} variant="destructive">
            Remove combination
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <NotificationError
        showAlertDialog={showAlertError}
        setShowAlertDialog={setShowAlertError}
        title={title}
        messageError={messageError}
        ReactElement={<ExclamationTriangle className="size-11 mr-1" />}
      />
      <Confirmation
        title={title}
        messageError={messageError}
        showAlertDialog={showAlertMsg}
        setShowAlertDialog={setShowAlertMsg}
        actionYes={actionYes}
        ReactElement={<QuestionMarkCircle className="mr-1" />}
      />
    </>
  )
}

// Component hiển thị Platform Settings
const PlatformSettingsSection = ({ typeAccount }: { typeAccount: 'account1' | 'account2' }) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair, currentAccountPair } = Combination
  const [isAmountRoundingOpen, setIsAmountRoundingOpen] = useState(false)

  const dataAccountPair = useMemo(
    () => (typeAccount === 'account1' ? currentAccountPair.account1 : currentAccountPair.account2),
    [typeAccount, currentAccountPair]
  )

  const updateField = (field: string, value: string | number) => {
    const updatedList = listAccountPair.map((item) => {
      if (item.id === currentAccountPair.id) {
        return {
          ...item,
          [typeAccount]: {
            ...item[typeAccount],
            [field]: value
          }
        }
      }
      return item
    })
    setListAccountPair(updatedList)
  }

  const updateBetAmount = (value: number) => {
    updateField('betAmount', value)
  }

  const updateCheckOdd = (checked: boolean) => {
    updateField('checkOdd', Number(checked))
  }

  const updateOddFrom = (value: number) => {
    updateField('oddFrom', value)
  }

  const updateOddTo = (value: number) => {
    updateField('oddTo', value)
  }

  const updateBet = (checked: boolean) => {
    updateField('bet', Number(checked))
  }

  const updateContra = (checked: boolean) => {
    updateField('contra', Number(checked))
  }

  if (!currentAccountPair || !dataAccountPair) {
    return <div className="text-gray-500">Select a combination to configure settings</div>
  }

  return (
    <div className="p-4 ">
      <div className="text-center mb-4">
        <h4 className={`${getThemeClass('text')} font-semibold`}>
          {dataAccountPair.platform || 'Unknown Platform'}
        </h4>
        <p className="text-gray-400 text-sm">{dataAccountPair.loginID || 'Unknown Account'}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-gray-300 text-sm">Bet Amount ($)</label>
          <InputNumber
            precision={0}
            step={1}
            value={Number(dataAccountPair?.betAmount) ?? 100}
            onChange={(value) => updateBetAmount(value)}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Checkbox
              id={`checkOdd_${typeAccount}`}
              checked={Boolean(dataAccountPair?.checkOdd)}
              onCheckedChange={updateCheckOdd}
            />
            <Label htmlFor={`checkOdd_${typeAccount}`} className="text-gray-300 text-sm">
              Check Odds
            </Label>
          </div>
          <div className="flex gap-2">
            <InputNumber
              precision={2}
              step={0.01}
              min={-2}
              disabled={!dataAccountPair?.checkOdd}
              value={Number(dataAccountPair?.oddFrom) ?? 0.01}
              onChange={(value) => updateOddFrom(value)}
            />
            <span className="text-gray-400 self-center">to</span>
            <InputNumber
              precision={2}
              step={0.01}
              max={2}
              disabled={!dataAccountPair?.checkOdd}
              value={Number(dataAccountPair?.oddTo) ?? 0.01}
              onChange={(value) => updateOddTo(value)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`bet_${typeAccount}`}
              checked={Boolean(dataAccountPair?.bet)}
              onCheckedChange={updateBet}
            />
            <Label htmlFor={`bet_${typeAccount}`} className="text-gray-300">
              Bet
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`contra_${typeAccount}`}
              checked={Boolean(dataAccountPair?.contra)}
              onCheckedChange={updateContra}
            />
            <Label htmlFor={`contra_${typeAccount}`} className="text-gray-300">
              Contra
            </Label>
          </div>
        </div>

        <div className="mt-6">
          <AmountRounding
            key={`${typeAccount}-${currentAccountPair?.id}`}
            isOpen={isAmountRoundingOpen}
            onToggle={() => setIsAmountRoundingOpen(!isAmountRoundingOpen)}
            account={typeAccount}
          />
        </div>
      </div>
    </div>
  )
}

const GeneralSettingsSection = ({
  typeAccount,
  handleShowPopupLineRange
}: {
  typeAccount: 'account1' | 'account2'
  handleShowPopupLineRange: (lineKey: string, typeAccount: 'account1' | 'account2') => void
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair, currentAccountPair } = Combination

  const dataAccountPair = useMemo(
    () => (typeAccount === 'account1' ? currentAccountPair.account1 : currentAccountPair.account2),
    [typeAccount, currentAccountPair]
  )

  const updateGeneralSetting = (value: string) => {
    const updatedList = listAccountPair.map((item) => {
      if (item.id === currentAccountPair.id) {
        return {
          ...item,
          [typeAccount]: {
            ...item[typeAccount],
            generalSetting: value
          }
        }
      }
      return item
    })
    setListAccountPair(updatedList)
  }

  if (!currentAccountPair || !dataAccountPair) {
    return null
  }

  return (
    <div className="px-4 pb-4">
      <h5 className="text-gray-200 font-semibold mb-3 border-[#22262F] border-t pt-4">
        {dataAccountPair.platform} - {dataAccountPair.loginID}
      </h5>
      <RadioGroup
        value={dataAccountPair?.generalSetting || 'BetAll'}
        onValueChange={updateGeneralSetting}
        className="flex space-x-4 items-center"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="BetAll" id={`BetAll_${typeAccount}`} />
          <Label htmlFor={`BetAll_${typeAccount}`} className="text-gray-300">
            Bet All
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="NoBet" id={`NoBet_${typeAccount}`} />
          <Label htmlFor={`NoBet_${typeAccount}`} className="text-gray-300">
            No Bet
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="BetSelected" id={`BetSelected_${typeAccount}`} />
          <Label htmlFor={`BetSelected_${typeAccount}`} className="text-gray-300">
            Bet Selected
          </Label>
        </div>
      </RadioGroup>
      <DetailedSettingsSection
        typeAccount={typeAccount}
        handleShowPopupLineRange={handleShowPopupLineRange}
      />
    </div>
  )
}

const DetailedSettingsSection = ({
  typeAccount,
  handleShowPopupLineRange
}: {
  typeAccount: 'account1' | 'account2'
  handleShowPopupLineRange: (lineKey: string, typeAccount: 'account1' | 'account2') => void
}) => {
  const { Combination } = useContext(AccountPairContext)
  const { listAccountPair, setListAccountPair, currentAccountPair } = Combination
  const [keyCurrent, setKeyCurrent] = useState('')
  const [showBetTo, setShowBetTo] = useState(false)
  const [showGameRange, setShowGameRange] = useState(false)

  const dataAccountPair = useMemo(
    () => (typeAccount === 'account1' ? currentAccountPair.account1 : currentAccountPair.account2),
    [typeAccount, currentAccountPair]
  )

  const isBetSelected = dataAccountPair?.generalSetting === 'BetSelected'

  const updateField = (field: string, value: number) => {
    const updatedList = listAccountPair.map((item) => {
      if (item.id === currentAccountPair.id) {
        return {
          ...item,
          [typeAccount]: {
            ...item[typeAccount],
            [field]: value
          }
        }
      }
      return item
    })
    setListAccountPair(updatedList)
  }

  const updateCheckBox = (key: string, value: boolean) => {
    updateField(key, Number(value))
  }

  const handleShowPopup = ({ key, typeDetail }: { key: string; typeDetail: string }) => {
    setKeyCurrent(key)
    if (typeDetail === 'Range') {
      setShowBetTo(false)
      setShowGameRange(true)
    }
    if (typeDetail === 'BetTo') {
      setShowBetTo(true)
      setShowGameRange(false)
    }
  }

  if (!currentAccountPair || !dataAccountPair) {
    return null
  }
  const handleLineRangeClick = (key: string) => {
    handleShowPopupLineRange(key, typeAccount)
  }

  return (
    <div className="pt-4">
      <div className="text-sm font-semibold text-[#85888E] mb-4">Detailed Settings</div>
      <div className="grid grid-cols-2 gap-4">
        {['FT', 'Half'].map((category) => (
          <div key={category} className="flex flex-col gap-1.5 space-y-2">
            <h6 className="text-gray-400 text-sm font-medium">{category}</h6>
            {CHECK_BOX_DETAIL_SETTING.filter((cb) => cb.key.startsWith(category)).map(
              ({ key, label }) => {
                const labelTextBetTo = getBetText(dataAccountPair[`${key}_Detail`]?.betTo)

                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className="flex gap-2 col-span-4 items-center">
                      <Checkbox
                        disabled={!isBetSelected}
                        id={`${key}_${typeAccount}`}
                        checked={Boolean(dataAccountPair[key])}
                        onCheckedChange={(checked) => updateCheckBox(key, checked as boolean)}
                      />
                      <Label
                        className="cursor-pointer text-gray-300 text-sm"
                        htmlFor={`${key}_${typeAccount}`}
                      >
                        {label}
                      </Label>
                    </div>
                    <div className="relative col-span-2">
                      <p
                        className={`${dataAccountPair[key] === 1 ? 'block' : 'hidden'} cursor-pointer underline italic text-blue-400 text-sm ${isBetSelected ? '' : 'opacity-50'}`}
                        onClick={() => isBetSelected && handleLineRangeClick(key)}
                      >
                        {key.includes('PK') ? '' : labelTextBetTo}
                      </p>
                      {showBetTo && keyCurrent === key && (
                        <BetTo
                          typeAccount={typeAccount}
                          keyCurrent={keyCurrent}
                          label={label}
                          setShowBetTo={setShowBetTo}
                        />
                      )}
                    </div>
                    <div className="relative col-span-3">
                      <p
                        className={`${dataAccountPair[key] === 1 ? 'block' : 'hidden'} cursor-pointer text-end underline italic text-blue-400 text-sm ${isBetSelected ? '' : 'opacity-50'}`}
                        onClick={() => isBetSelected && handleLineRangeClick(key)}
                      >
                        {dataAccountPair[`${key}_Detail`]?.range.betAll === 1
                          ? 'Range: All'
                          : 'Range: Custom'}
                      </p>
                      {showGameRange && keyCurrent === key && (
                        <GameRange
                          typeAccount={typeAccount}
                          keyCurrent={keyCurrent}
                          label={label}
                          setShowGameRange={setShowGameRange}
                        />
                      )}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Component hiển thị Bet Settings
const BetSettingsSection = () => {
  const { Combination } = useContext(AccountPairContext)
  const { currentAccountPair } = Combination
  const [showPopupLineRangeSetting, setShowPopupLineRangeSetting] = useState(false)
  const [currentLineKey, setCurrentLineKey] = useState('')
  const [currentTypeAccount, setCurrentTypeAccount] = useState<'account1' | 'account2'>('account1')

  const handleShowPopupLineRange = (lineKey: string, typeAccount: 'account1' | 'account2') => {
    setCurrentLineKey(lineKey)
    setCurrentTypeAccount(typeAccount)
    setShowPopupLineRangeSetting(true)
  }

  if (!currentAccountPair || !currentAccountPair.id) {
    return (
      <div className="mt-4 bg-[#0C0E12] border border-[#22262F] rounded p-8 text-center">
        <p className="text-gray-500">Select a combination to configure bet settings</p>
      </div>
    )
  }

  return (
    <div className="mt-4 bg-[#0C0E12] border border-[#22262F] rounded">
      {/* Header */}
      <div className="px-4 py-2 bg-[#0C0E12] border-b border-[#22262F]">
        <h3 className="text-gray-200 font-semibold">Bet Settings</h3>
      </div>

      {/* Content */}
      <div className="px-4">
        <div className="grid grid-cols-2">
          <div className="border-r border-[#22262F]">
            <PlatformSettingsSection typeAccount="account1" />
            <GeneralSettingsSection
              typeAccount="account1"
              handleShowPopupLineRange={handleShowPopupLineRange}
            />
          </div>
          <div>
            <PlatformSettingsSection typeAccount="account2" />
            <GeneralSettingsSection
              typeAccount="account2"
              handleShowPopupLineRange={handleShowPopupLineRange}
            />
          </div>
        </div>
        {/* Modals */}
        {showPopupLineRangeSetting && (
          <LineRangeSettingsModal
            setShowAmountRounderSetting={setShowPopupLineRangeSetting}
            typeAccount={currentTypeAccount}
            lineKey={currentLineKey}
          />
        )}
      </div>
    </div>
  )
}

// Main component
const AccountPairContent = () => {
  const context = useContext(AccountPairContext)
  const { listAccountPair, currentAccountPair, setListAccountPair } = context.Combination
  const { isClearInvalidAccount } = context.ClearInvalidAccount
  const [showQuickOddsRangeSetting, setShowQuickOddsRangeSetting] = useState(false)
  const [showQuickBetTargetSetting, setShowQuickBetTargetSetting] = useState(false)
  const [showQuickBetAmountSetting, setShowQuickBetAmountSetting] = useState(false)
  const [showQuickAmountRounderSetting, setShowQuickAmountRounderSetting] = useState(false)
  const [account1, setAccount1] = useState<AccountType>()
  const [account2, setAccount2] = useState<AccountType>()
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [showAddSelectionModal, setShowAddSelectionModal] = useState(false)
  const handleAddSelectedPairs = (pairs: AccountPairType[]) => {
    const merged: AccountPairType[] = (() => {
      const map = new Map<string, AccountPairType>(listAccountPair.map((p) => [p.id, p]))
      for (const p of pairs) {
        if (!map.has(p.id)) map.set(p.id, p)
      }
      return Array.from(map.values())
    })()

    setListAccountPair(merged)
  }
  const handleSave = () => {
    const dataAccountPair = sanitizeAccountsData(listAccountPair)
    window.electron.ipcRenderer.send('AccountPairWindow', {
      isClearInvalidAccount,
      dataAccountPair
    })

    // Show success notification then redirect after a short delay
    setShowSaveSuccess(true)
    setMessageSuccess('Save successful!')
    setTimeout(() => {
      setShowSaveSuccess(false)
      window.electron.ipcRenderer.send('CloseAccountPairWindow')
    }, 1500)
  }
  const quickOddsRangeSetting = () => {
    setShowQuickOddsRangeSetting(true)
  }
  return (
    <AccountSelectionContext.Provider value={{ account1, account2, setAccount1, setAccount2 }}>
      <div className="bg-[#0C0E12] mt-2 flex flex-col overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)]">
        {/* Action Buttons */}
        <ActionButtons
          setShowSaveSuccess={setShowSaveSuccess}
          setMessageSuccess={setMessageSuccess}
          openAddSelectionModal={() => setShowAddSelectionModal(true)}
        />

        {/* Main Content - 3 columns */}
        <div className="flex gap-4">
          <div className="w-2/3">
            <div className="w-full flex">
              <Account1List />
              <Account2List />
            </div>

            <BetSettingsSection />
          </div>

          <div className="w-1/3">
            <CombinationsList />
          </div>
        </div>

        <div
          className={`pt-6 flex  border-t border-[#22262F] mt-6 ${currentAccountPair && currentAccountPair?.id ? 'justify-between' : 'justify-end'}`}
        >
          {currentAccountPair && currentAccountPair?.id && (
            <div className="border rounded-xl border-[#373A41] overflow-hidden flex-shrink-0">
              <Button
                variant="plain-white"
                className="border-r border-[#373A41] rounded-none"
                onClick={quickOddsRangeSetting}
              >
                Odd Range Settings
              </Button>
              <Button
                variant="plain-white"
                className="border-r border-[#373A41] rounded-none"
                onClick={() => setShowQuickBetTargetSetting(true)}
              >
                Bet Target Settings
              </Button>
              <Button
                variant="plain-white"
                onClick={() => setShowQuickBetAmountSetting(true)}
                className="border-r border-[#373A41] rounded-none"
              >
                Amount Settings
              </Button>
              <Button variant="plain-white" onClick={() => setShowQuickAmountRounderSetting(true)}>
                Amount Rounder Settings
              </Button>
              {showQuickOddsRangeSetting && (
                <QuickOddsRangeSettingModal
                  setShowQuickOddsRangeSetting={setShowQuickOddsRangeSetting}
                />
              )}
              {showQuickBetTargetSetting && (
                <QuickBetTargetSettingModal
                  setShowQuickBetTargetSetting={setShowQuickBetTargetSetting}
                />
              )}
              {showQuickBetAmountSetting && (
                <QuickAmountSettingModal setShowQuickAmountSetting={setShowQuickBetAmountSetting} />
              )}
              {showQuickAmountRounderSetting && (
                <QuickAmountRounderSettingModal
                  setShowQuickAmountRounderSetting={setShowQuickAmountRounderSetting}
                />
              )}
            </div>
          )}
          {showAddSelectionModal && (
            <AddSelectedAccountPairModal
              onClose={() => setShowAddSelectionModal(false)}
              onSave={(pairs) => {
                handleAddSelectedPairs(pairs)
              }}
            />
          )}
          <div>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>

        {/* Success Notification */}
        {showSaveSuccess && (
          <div className="fixed top-[5%] right-[2%] bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-pulse">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>{messageSuccess}</span>
          </div>
        )}
      </div>
    </AccountSelectionContext.Provider>
  )
}

export default function AccountPair() {
  return (
    <AccountPairProvider>
      <AccountPairContent />
    </AccountPairProvider>
  )
}
