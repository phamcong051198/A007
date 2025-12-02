import { createContext, useEffect, useState } from 'react'

import { AccountPairType } from '@shared/common/types'
import { AccountType } from '@shared/common/types'
interface ContextType {
  ListAccount: {
    listAccount: AccountType[]
    setListAccount: (value: AccountType[]) => void
  }
  Combination: {
    listAccountPair: AccountPairType[]
    setListAccountPair: (value: AccountPairType[]) => void

    currentAccountPair: AccountPairType
    setCurrentAccountPair: (value: AccountPairType) => void
  }
  ClearInvalidAccount: {
    isClearInvalidAccount: boolean
    setIsClearInvalidAccount: () => void
  }
}
export const AccountPairContext = createContext<ContextType>({
  ClearInvalidAccount: {
    isClearInvalidAccount: false,
    setIsClearInvalidAccount: () => {}
  },
  Combination: {
    currentAccountPair: {} as AccountPairType,
    listAccountPair: [],

    setCurrentAccountPair: () => {},
    setListAccountPair: () => {}
  },
  ListAccount: {
    listAccount: [],
    setListAccount: () => {}
  }
})

export const AccountPairProvider = ({ children }) => {
  const [listAccount, setListAccount] = useState<AccountType[]>([])
  const [isClearInvalidAccount, setIsClearInvalidAccount] = useState(false)
  const [listAccountPair, setListAccountPair] = useState<AccountPairType[]>([])
  const [currentAccountPair, setCurrentAccountPair] = useState<AccountPairType>(
    {} as AccountPairType
  )

  useEffect(() => {
    const fetchData = async () => {
      const listAccount = await window.electron.ipcRenderer.invoke('GetAccount1Account2')
      setListAccount(listAccount)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const matchedAccountPair = listAccountPair.find(
      (accountPair) => accountPair.id === currentAccountPair.id
    )

    if (matchedAccountPair) {
      setCurrentAccountPair(matchedAccountPair)
    }
  }, [listAccountPair])

  useEffect(() => {
    const fetchListAccountPair = async () => {
      const data = (await window.electron.ipcRenderer.invoke(
        'GetListAccountPair'
      )) as AccountPairType[]

      setListAccountPair(data)
      if (data.length) {
        setCurrentAccountPair(data[0])
      }
    }
    fetchListAccountPair()
  }, [])

  useEffect(() => {
    const handleData = (_, listAccountPairAddSelected: AccountPairType[]) => {
      const updatedData = [
        ...listAccountPair,
        ...listAccountPairAddSelected.filter(
          (newItem) =>
            !listAccountPair.some(
              (rootItem) =>
                (rootItem.account1.id === newItem.account1.id &&
                  rootItem.account2.id === newItem.account2.id) ||
                (rootItem.account1.id === newItem.account2.id &&
                  rootItem.account2.id === newItem.account1.id)
            )
        )
      ]

      setListAccountPair(updatedData)
      setCurrentAccountPair(updatedData[0])
    }

    window.electron.ipcRenderer.on('ListAccountPairAddSelected', handleData)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('ListAccountPairAddSelected')
    }
  }, [listAccountPair])

  const contextValue: ContextType = {
    ClearInvalidAccount: {
      isClearInvalidAccount,
      setIsClearInvalidAccount: () => {
        setIsClearInvalidAccount(true)
      }
    },
    Combination: {
      currentAccountPair,
      listAccountPair,
      setCurrentAccountPair: (value) => setCurrentAccountPair(value),
      setListAccountPair: (value) => setListAccountPair(value)
    },
    ListAccount: {
      listAccount,
      setListAccount: (value) => setListAccount(value)
    }
  }
  return <AccountPairContext.Provider value={contextValue}>{children}</AccountPairContext.Provider>
}
