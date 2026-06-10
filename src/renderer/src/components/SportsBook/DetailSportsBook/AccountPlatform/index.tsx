import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import CheckboxField from '@renderer/components/SportsBook/CheckboxField'
import AccountInfo from '@renderer/components/SportsBook/DetailSportsBook/AccountPlatform/AccountInfo'
import DeleteAccount from '@renderer/components/SportsBook/DetailSportsBook/AccountPlatform/DeleteAccount'
import { useAccountUpdate } from '@renderer/context/AccountContext'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'

import { AccountType } from '@shared/common/types'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AccountPlatformProps {
  account: AccountType
  index: number
  highlight: string
}

interface AccountState {
  buttonText: string
  log: string | null
  betCredit: string
  checkBet: boolean
  checkRefresh: boolean
  checkAutoLogin: boolean
  checkLockURL: boolean
  statusLogin: string | null
}

const AccountPlatform: React.FC<AccountPlatformProps> = ({ account, index, highlight }) => {
  const updateData = useAccountUpdate()

  const [accountState, setAccountState] = useState<AccountState>({
    betCredit: account.credit,
    buttonText: account.status,
    checkAutoLogin: Boolean(account.checkBoxAutoLogin),
    checkBet: Boolean(account.checkBoxBet),
    checkLockURL: Boolean(account.checkBoxLockURL),
    checkRefresh: Boolean(account.checkBoxRefresh),
    log: account.textLog,
    statusLogin: account.statusLogin
  })

  useEffect(() => {
    setAccountState({
      betCredit: account.credit,
      buttonText: account.status,
      checkAutoLogin: Boolean(account.checkBoxAutoLogin),
      checkBet: Boolean(account.checkBoxBet),
      checkLockURL: Boolean(account.checkBoxLockURL),
      checkRefresh: Boolean(account.checkBoxRefresh),
      log: account.textLog,
      statusLogin: account.statusLogin
    })
  }, [account])

  useEffect(() => {
    if (updateData?.id === account.id) {
      setAccountState((prev) => {
        const newState: AccountState = {
          ...prev,
          betCredit: updateData.credit ?? prev.betCredit,
          buttonText: updateData.status ?? prev.buttonText,
          checkAutoLogin:
            updateData.checkBoxAutoLogin !== undefined
              ? Boolean(updateData.checkBoxAutoLogin)
              : prev.checkAutoLogin,
          checkBet:
            updateData.checkBoxBet !== undefined ? Boolean(updateData.checkBoxBet) : prev.checkBet,
          checkLockURL:
            updateData.checkBoxLockURL !== undefined
              ? Boolean(updateData.checkBoxLockURL)
              : prev.checkLockURL,
          checkRefresh:
            updateData.checkBoxRefresh !== undefined
              ? Boolean(updateData.checkBoxRefresh)
              : prev.checkRefresh,
          log: updateData.textLog ?? prev.log,
          statusLogin: updateData.statusLogin ?? prev.statusLogin
        }
        return newState
      })
    }
  }, [updateData, account.id])

  const deleteAccount = useCallback(() => {
    window.electron.ipcRenderer.send('DeleteAccount', account)
  }, [account])

  const handleCheckboxChange = useCallback(
    (field: string, stateKey: keyof AccountState) => {
      setAccountState((prev) => {
        const newValue = !prev[stateKey]
        window.electron.ipcRenderer.send('UpdateAccount', {
          accountId: account.id,
          field,
          value: newValue ? 1 : 0
        })
        return { ...prev, [stateKey]: newValue }
      })
    },
    [account.id]
  )

  const handleAction = useCallback(() => {
    if (accountState.buttonText === 'Login') {
      window.electron.ipcRenderer.send('LoginAccount', account)
      setAccountState(
        (prev) =>
          ({
            ...prev,
            buttonText: 'In-Progress',
            log: 'Waiting for login...'
          }) as AccountState
      )
    } else if (accountState.buttonText === 'Logout' || accountState.buttonText === 'Exit') {
      window.electron.ipcRenderer.send('LogoutAccount', account)
      setAccountState(
        (prev) =>
          ({
            ...prev,
            buttonText: 'Login',
            log: null
          }) as AccountState
      )
    }
  }, [account, accountState.buttonText])

  const buttonClass = useMemo(() => {
    const classes: Record<string, string> = {
      Exit: 'underline text-[#FF0000] hover:cursor-pointer',
      'In-Progress': 'text-[#FF8C00]',
      Logout: 'underline text-[#FF0000] hover:cursor-pointer'
    }
    return classes[accountState.buttonText] || 'underline text-blue-color hover:cursor-pointer'
  }, [accountState.buttonText])

  const getLogClass = useMemo(() => {
    if (
      ((accountState.buttonText === 'Logout' || accountState.buttonText === 'Exit') &&
        accountState.statusLogin === 'Fail') ||
      (accountState.buttonText === 'In-Progress' && accountState.log?.includes('ERROR'))
    ) {
      return 'text-red-color'
    }

    if (['In-Progress', 'Logout'].includes(accountState.buttonText)) {
      return 'text-green-color'
    }

    return 'text-[#a9a9a9]'
  }, [accountState.buttonText, accountState.statusLogin, accountState.log])

  function isTextMatched(text: string, highlight: string): boolean {
    if (!highlight?.trim()) return false
    return text.toLowerCase().includes(highlight.toLowerCase())
  }

  return (
    <div className="flex items-center pl-[12px] pr-[7px] text-sm mb-[2px]">
      <div className="flex items-center w-[143px]">
        <div className="mr-2">{index + 1}</div>
        <div className="flex">
          {!account.statusPair && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <ExclamationTriangle
                    className={twMerge(
                      'size-5  mr-1',
                      !account.loginID || !account.password
                        ? 'text-red-500 hover:text-[#FF0000]'
                        : 'text-[#FFA500] hover:text-[#FF8C00]'
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-white text-blue-color border border-gray-300 rounded-md ml-20 mb-[-8px] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
                  {!account.loginID || !account.password ? (
                    <div>
                      <p className="text-gray-700 font-bold ">Cannot login to this account</p>
                      <p className="text-gray-700  ">
                        Account: Not setup enough username or password
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-bold ">
                        Cannot bet on this account - Account pair not set up
                      </p>
                      <p className="text-gray-700  ">
                        Account: {account.platformName}-{account.loginID} is not set up for betting
                      </p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isTextMatched(account.platformName + account.loginID, highlight) ? (
            <>
              <div style={{ backgroundColor: 'yellow', padding: '3px' }}>
                <AccountInfo account={account} />
              </div>
            </>
          ) : (
            <>
              <AccountInfo account={account} />
            </>
          )}
        </div>
      </div>
      <p className="border border-border-default w-[177px] px-1">{account.loginURL}</p>
      <button
        onClick={account.loginID && account.password ? handleAction : undefined}
        className={twMerge(
          'font-bold w-[85px] text-center text-[13px]',
          account.loginID && account.password ? buttonClass : 'text-gray-600'
        )}
      >
        {accountState.buttonText}
      </button>

      <div className="flex h-6 justify-center items-center">
        <p className="font-medium h-full w-[52px] flex items-center justify-center">
          {accountState.buttonText === 'Login' || accountState.buttonText === 'In-Progress'
            ? 0
            : (Math.floor(Number(accountState.betCredit.replace(/,/g, '')) * 100) / 100).toFixed(2)}
        </p>

        <div className="flex h-full">
          <CheckboxField
            key="checkbox_bet"
            id={`${account.id}_checkbox_bet`}
            checked={accountState.checkBet}
            onChange={() => handleCheckboxChange('checkBoxBet', 'checkBet')}
            className={'w-[62px] flex items-center justify-center'}
          />

          <CheckboxField
            key="checkbox_autoLogin"
            id={`${account.id}_checkbox_autoLogin`}
            checked={accountState.checkAutoLogin}
            onChange={() => handleCheckboxChange('checkBoxAutoLogin', 'checkAutoLogin')}
            className={'w-[62px] flex items-center justify-center'}
          />
        </div>
      </div>
      <div
        className={twMerge(
          'flex-1 w-1 h-6 flex font-medium items-center justify-start overflow-hidden text-ellipsis ml-6 mr-1 border border-border-default  rounded-md',
          getLogClass
        )}
      >
        {['In-Progress', 'Logout', 'Exit'].includes(accountState.buttonText) && (
          <p className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{accountState.log}</p>
        )}
      </div>
      <DeleteAccount deleteAccount={deleteAccount} />
    </div>
  )
}

export default React.memo(AccountPlatform)
