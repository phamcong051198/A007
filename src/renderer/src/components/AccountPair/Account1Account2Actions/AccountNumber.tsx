import React, { useRef, useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AccountType } from '@shared/common/types'

interface Props {
  title: string
  accountCurrent: AccountType | undefined
  listAccount: AccountType[]
  setAccount: (value: AccountType) => void
}

const AccountNumber = ({ title, accountCurrent, listAccount, setAccount }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const moveSelection = useCallback(
    (direction: 'prev' | 'next') => {
      const index = listAccount.findIndex((acc) => acc.id === accountCurrent?.id)
      if (index === -1) return

      let newIndex = index
      if (direction === 'prev' && index > 0) {
        newIndex = index - 1
      } else if (direction === 'next' && index < listAccount.length - 1) {
        newIndex = index + 1
      }

      if (newIndex !== index) {
        setAccount(listAccount[newIndex])
      }
    },
    [listAccount, accountCurrent, setAccount]
  )

  // Xử lý sự kiện keydown khi component được focus
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

  // Lắng nghe click vào/ra component
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
    <div ref={containerRef} className="flex flex-col">
      <div>{title}</div>
      <div className="flex-1 border border-gray-400 w-[353px] bg-white p-[1px] custom-scrollbar overflow-y-auto">
        {listAccount.map((account) => (
          <p
            key={account.id}
            className={twMerge(
              'pl-1 cursor-pointer hover:bg-blue-500 hover:text-white transition duration-300',
              clsx({
                'border-blue-500 bg-blue-500 text-white': accountCurrent?.id === account.id
              })
            )}
            onClick={() => setAccount(account)}
          >
            {account.platformName}-{account?.loginID}
          </p>
        ))}
      </div>
    </div>
  )
}

export default React.memo(AccountNumber)
