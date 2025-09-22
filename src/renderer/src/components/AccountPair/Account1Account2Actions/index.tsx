import { v4 as uuidv4 } from 'uuid'
import { memo, useCallback, useContext, useEffect, useState } from 'react'

import AccountNumber from '@renderer/components/AccountPair/Account1Account2Actions/AccountNumber'
import Actions from '@renderer/components/AccountPair/Account1Account2Actions/Actions'
import { NotificationError } from '@renderer/components/NotificationPopup/NotificationError'
import { Confirmation } from '@renderer/components/NotificationPopup/Confirmation'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import QuestionMarkCircle from '@renderer/icons/question-mark-circle'
import { AccountType } from '@shared/common/types'
import { generateAccountData } from '@renderer/lib/generateAccountData'
import { AccountPairContext } from '@renderer/context/AccountPairContext'
import { generateAddAllAccountPair } from '@renderer/lib/generateAddAllAccountPair'
import { AccountPairType } from '@shared/common/types'

const Account1Account2ActionsComponent = () => {
  const context = useContext(AccountPairContext)

  const { listAccountPair, setListAccountPair, currentAccountPair, setCurrentAccountPair } =
    context.Combination
  const { setIsClearInvalidAccount } = context.ClearInvalidAccount
  const { listAccount, setListAccount } = context.ListAccount

  const [account1, setAccount1] = useState<AccountType>()
  const [account2, setAccount2] = useState<AccountType>()

  const [title, setTitle] = useState('Error')
  const [messageError, setMessageError] = useState('')
  const [showAlertError, setShowAlertError] = useState(false)
  const [showAlertMsg, setShowAlertMsg] = useState(false)

  const [actionYes, setActionYes] = useState<() => void>(() => {})

  const addAccountPair = async () => {
    if (!account1 || !account2) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    const [firstAccount, secondAccount] = [account1, account2].sort((a, b) =>
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
  }

  const removeAccountPair = () => {
    if (!listAccountPair.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }
    showConfirmation('Confirmation', 'Delete selected combinations?', () => {
      setShowAlertMsg(false)
      setListAccountPair(
        listAccountPair.filter((accountPair) => accountPair.id != currentAccountPair.id)
      )
    })
  }

  const addAllAccountPair = () => {
    if (!listAccount.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    showConfirmation('Confirmation', 'Add all combinations?', () => {
      const listAccountPair = generateAddAllAccountPair(listAccount)
      setListAccountPair(listAccountPair)
      setCurrentAccountPair(listAccountPair[0])
      setShowAlertMsg(false)
    })
  }

  const removeAllAccountPair = () => {
    if (!listAccountPair.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    showConfirmation('Confirmation', 'Delete all combinations?', () => {
      setListAccountPair([])
      setCurrentAccountPair({} as AccountPairType)
      setShowAlertMsg(false)
    })
  }

  const addSelectionAccountPair = () => {
    window.electron.ipcRenderer.send('ShowAddSelectionAccountPair')
  }

  const showConfirmation = useCallback(
    (title: string, message: string, actionYesCallback: () => void) => {
      setTitle(title)
      setMessageError(message)
      setShowAlertMsg(true)
      setActionYes(() => actionYesCallback)
    },
    []
  )

  const handleClearInvalidAccount = () => {
    showConfirmation(
      'Confirmation',
      'Confirm to clear invalid account(s)?',
      actionClearInvalidAccount
    )
  }
  const actionClearInvalidAccount = () => {
    setIsClearInvalidAccount()

    const validAccounts = listAccount.filter((account) => account.statusDelete == 0)
    const dataIds = new Set(validAccounts.map((validAccount) => validAccount.id))

    const validCombination = listAccountPair.filter(
      (item) => dataIds.has(item.account1.id) && dataIds.has(item.account2.id)
    )

    setListAccount(validAccounts)
    setListAccountPair(validCombination)

    setShowAlertMsg(false)
  }
  return (
    <div className="flex-1 flex py-3.5 px-2 overflow-hidden">
      <div className="flex ">
        <AccountNumber
          title="Account 1"
          accountCurrent={account1}
          listAccount={listAccount}
          setAccount={setAccount1}
        />
        <AccountNumber
          title="Account 2"
          accountCurrent={account2}
          listAccount={listAccount}
          setAccount={setAccount2}
        />
      </div>
      <Actions
        addAccountPair={addAccountPair}
        removeAccountPair={removeAccountPair}
        addAllAccountPair={addAllAccountPair}
        removeAllAccountPair={removeAllAccountPair}
        addSelectionAccountPair={addSelectionAccountPair}
        handleClearInvalidAccount={handleClearInvalidAccount}
      />
      <NotificationError
        showAlertDialog={showAlertError}
        setShowAlertDialog={setShowAlertError}
        title={title}
        messageError={messageError}
        ReactElement={<ExclamationTriangle className="size-11 text-[#FF8C00]   mr-1" />}
      />
      <Confirmation
        title={title}
        messageError={messageError}
        showAlertDialog={showAlertMsg}
        setShowAlertDialog={setShowAlertMsg}
        actionYes={actionYes}
        ReactElement={<QuestionMarkCircle className="text-red-500 mr-1" />}
      />
    </div>
  )
}

export const Account1Account2Actions = memo(Account1Account2ActionsComponent)
