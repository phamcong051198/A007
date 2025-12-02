import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'

import FormAddControls from '@renderer/components/SportsBook/DetailSportsBook/FormAddControls'
import Plus from '@renderer/icons/plus'

export default function AddAccount({ handleAddAccount, sportsBook }) {
  const [showFormAddControls, setIsShowFormAddControls] = useState(false)

  const handleRightClick = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsShowFormAddControls(true)
  }

  return (
    <Fragment>
      <button
        className={`${'bg-blue-color'} hover:opacity-90 text-sm w-[130px] h-[33px] rounded-[8px] text-white gap-[4px] flex items-center justify-center`}
        onClick={() => handleAddAccount()}
        onContextMenu={handleRightClick}
      >
        <Plus />
        <span className="ml-[4px]">Add Account</span>
      </button>

      {showFormAddControls && (
        <FormAddControls
          setIsShowFormAddControls={setIsShowFormAddControls}
          platform={sportsBook}
        />
      )}
    </Fragment>
  )
}
