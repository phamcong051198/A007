import Xmark from '@renderer/icons/x-mark'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

const FormAddControls = ({ setIsShowFormAddControls, platform }) => {
  const { id: activeId } = useParams()

  const maxControls = 300 - platform.accounts.length

  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleOK = () => {
    if (maxControls === 0) {
      setIsShowFormAddControls(false)
      return
    }

    const parsedValue = parseInt(inputValue || '0', 10)

    if (!inputValue || isNaN(parsedValue) || parsedValue < 1 || parsedValue > maxControls) {
      setInputValue('')
      setErrorMessage(`Please enter a number between 1 and ${maxControls}`)
      return
    }

    setErrorMessage('')
    setIsShowFormAddControls(false)
    window.electron.ipcRenderer.send('AddControls', {
      activeId,
      platformName: platform.platform,
      platformURL: platform.url,
      numberAccount: +parsedValue
    })
  }

  return (
    <div className="font-medium p-3 border border-border-default fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-layout-color shadow-md w-80 rounded-lg">
      <div className="flex rounded-t-lg justify-between">
        <div className="flex items-center text-lg font-bold">Add multiple accounts</div>
        <div
          onClick={() => setIsShowFormAddControls(false)}
          className="p-1 hover:bg-gray-800 hover:text-white rounded-3xl transition duration-200 ease-in-out"
        >
          <Xmark className=" cursor-pointer size-4" />
        </div>
      </div>
      <div>
        <div className="flex py-3 justify-between text-sm">
          <div className={maxControls === 0 ? 'text-[#FF0000]' : ''}>
            {maxControls === 0
              ? 'Number of accounts has reached limit'
              : `Number of controls to add (1 to ${maxControls}):`}
            <div className="text-red-500 text-sm mt-2">{errorMessage || ''}</div>
          </div>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="w-full h-[40px] bg-transparent border border-border-default rounded-lg py-[10px] px-[14px] focus:border-gray-500"
          disabled={maxControls === 0}
          maxLength={14}
          onChange={(e) => {
            setInputValue(e.target.value)
            setErrorMessage('')
          }}
        />
        <div className="flex gap-3 mt-3">
          <div
            className="flex-1 border border-border-default py-1 rounded-md text-center hover:border-gray-700"
            onClick={() => setIsShowFormAddControls(false)}
          >
            Cancel
          </div>
          <div
            className="flex-1 py-1 rounded-md text-center hover:bg-blue-700 bg-blue-color"
            onClick={handleOK}
          >
            Save
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(FormAddControls)
