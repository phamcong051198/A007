import { useEffect, useRef, useState, memo, useContext, useCallback } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AccountPairContext } from '@renderer/context/AccountPairContext'

const CombinationComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const context = useContext(AccountPairContext)
  const { listAccountPair, currentAccountPair, setCurrentAccountPair } = context.Combination

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

  // Gắn hoặc gỡ lắng nghe phím khi được focus
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

  // Lắng nghe sự kiện click vào/ra component
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
    <div ref={containerRef} className="flex-1 py-3.5 flex flex-col gap-2 overflow-hidden">
      <div className="h-full">
        <div className="h-full flex flex-col">
          <div>Combination</div>
          <div className="flex-1 border border-gray-400 w-full bg-blue-50 p-[1px] overflow-auto custom-scrollbar">
            {listAccountPair.length > 0 &&
              listAccountPair.map((accountPair) => (
                <p
                  key={`${accountPair.id}`}
                  className={twMerge(
                    'cursor-pointer hover:bg-blue-500 hover:text-white pl-1 transition duration-300',
                    clsx({
                      'border-blue-500 bg-blue-500 text-white':
                        `${currentAccountPair.id}` === `${accountPair.id}`
                    })
                  )}
                  onClick={() => setCurrentAccountPair(accountPair)}
                >
                  {accountPair.account1.platform + '-' + accountPair.account1.loginID}
                  {' - '}
                  {accountPair.account2.platform + '-' + accountPair.account2.loginID}
                </p>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const Combination = memo(CombinationComponent)
