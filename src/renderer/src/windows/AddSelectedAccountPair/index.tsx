import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ExclamationTriangle from '@renderer/icons/exclamation-triangle'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Button } from '@renderer/components/ui/button'
import { AccountType, AccountPairType } from '@shared/common/types'
import { generateAccountData } from '@renderer/lib/generateAccountData'

export default function AddSelectedAccountPairModal({
  onClose,
  onSave
}: {
  onClose: () => void
  onSave: (pairs: AccountPairType[]) => void
}) {
  const [listAccount, setListAccount] = useState<AccountType[]>([])
  const [selectedIdsList1, setSelectedIdsList1] = useState<number[]>([])
  const [selectedIdsList2, setSelectedIdsList2] = useState<number[]>([])
  const [messageError, setMessageError] = useState('')
  const [showAlertError, setShowAlertError] = useState(false)

  useEffect(() => {
    const fetchListAccount = async () => {
      const accounts = await window.electron.ipcRenderer.invoke('GetAccount1Account2')
      setListAccount(accounts || [])
    }
    fetchListAccount()
  }, [])

  const handleCheckboxChange = (
    id: number,
    setter: React.Dispatch<React.SetStateAction<number[]>>,
    selectedIds: number[]
  ) => {
    if (selectedIds.includes(id)) setter(selectedIds.filter((s) => s !== id))
    else setter([...selectedIds, id])
  }

  const handleSave = () => {
    if (!listAccount.length) {
      onClose()
      return
    }
    if (!selectedIdsList1.length || !selectedIdsList2.length) {
      setMessageError('No item selected')
      setShowAlertError(true)
      return
    }

    const listAccount1 = listAccount.filter((account) => selectedIdsList1.includes(account.id))
    const listAccount2 = listAccount.filter((account) => selectedIdsList2.includes(account.id))

    const listAccountPairAddSelected: AccountPairType[] = []

    for (const a1 of listAccount1) {
      for (const a2 of listAccount2) {
        if (
          !listAccountPairAddSelected.some(
            (pair) =>
              (pair.account1.id === a1.id && pair.account2.id === a2.id) ||
              (pair.account1.id === a2.id && pair.account2.id === a1.id)
          )
        ) {
          let account1 = a1
          let account2 = a2
          if (
            account1.platformName > account2.platformName ||
            (account1.platformName === account2.platformName && account1.loginID > account2.loginID)
          ) {
            ;[account1, account2] = [account2, account1]
          }

          listAccountPairAddSelected.push({
            id: uuidv4() as string,
            isValid: account1.platformName === account2.platformName ? 0 : 1,
            key: `${account1.platformName}_${account2.platformName}`,
            account1: generateAccountData(account1),
            account2: generateAccountData(account2)
          })
        }
      }
    }

    window.electron.ipcRenderer.send('ListAccountPairAddSelected', listAccountPairAddSelected)
    onSave(listAccountPairAddSelected)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[900px] max-w-[95%] bg-[#0C0E12] border border-[#22262F] rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#22262F]">
          <h3 className="text-sm text-gray-200 font-semibold">Add Selected Account Pair</h3>
          <div className="flex items-center gap-2">
            <button
              className="text-gray-400 hover:text-gray-200"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="bg-[#0C0E12] rounded-md border border-[#22262F] overflow-hidden h-[310px] flex flex-col">
                <div className="px-4 py-2 border-b border-[#22262F] text-sm text-[#94979C] font-medium">
                  Select Account 1
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="p-1">
                    {listAccount.map((account) => {
                      const selected = selectedIdsList1.includes(account.id)
                      return (
                        <div
                          key={`l1-${account.id}`}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-sm transition-colors ${selected ? 'bg-[#101316] text-white' : 'hover:bg-[#0F1316] text-gray-300'} ${account.id !== listAccount[listAccount.length - 1]?.id ? 'border-b border-[#22262F]' : ''}`}
                          onClick={() =>
                            handleCheckboxChange(account.id, setSelectedIdsList1, selectedIdsList1)
                          }
                        >
                          <Checkbox
                            id={`list1_checkbox-${account.id}`}
                            checked={selected}
                            onChange={() =>
                              handleCheckboxChange(
                                account.id,
                                setSelectedIdsList1,
                                selectedIdsList1
                              )
                            }
                          />
                          <div className="flex-1 text-sm truncate">
                            <span className="text-[#9AA0A6]">{account.platformName}</span>
                            <span className="text-[#6B7280] ml-2">-</span>
                            <span className="ml-2">{account?.loginID}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center px-2">
              <p className="font-bold text-[#8FA7FF]">VS</p>
            </div>

            <div className="flex-1">
              <div className="bg-[#0C0E12] rounded-md border border-[#22262F] overflow-hidden h-[310px] flex flex-col">
                <div className="px-4 py-2 border-b border-[#22262F] text-sm text-[#94979C] font-medium">
                  Select Account 2
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="p-1">
                    {listAccount.map((account) => {
                      const selected = selectedIdsList2.includes(account.id)
                      return (
                        <div
                          key={`l2-${account.id}`}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-sm transition-colors ${selected ? 'bg-[#101316] text-white' : 'hover:bg-[#0F1316] text-gray-300'} ${account.id !== listAccount[listAccount.length - 1]?.id ? 'border-b border-[#22262F]' : ''}`}
                          onClick={() =>
                            handleCheckboxChange(account.id, setSelectedIdsList2, selectedIdsList2)
                          }
                        >
                          <Checkbox
                            id={`list2_checkbox-${account.id}`}
                            checked={selected}
                            onCheckedChange={() =>
                              handleCheckboxChange(
                                account.id,
                                setSelectedIdsList2,
                                selectedIdsList2
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 text-sm truncate">
                            <span className="text-[#9AA0A6]">{account.platformName}</span>
                            <span className="text-[#6B7280] ml-2">-</span>
                            <span className="ml-2">{account?.loginID}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="bordered-white" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>OK</Button>
          </div>

          {showAlertError && (
            <div className="mt-3 text-sm text-red-400 flex items-center gap-2">
              <ExclamationTriangle />
              <div>{messageError}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
