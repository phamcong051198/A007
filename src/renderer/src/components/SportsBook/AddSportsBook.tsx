import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'

import AddSportsBookModal from '@renderer/components/Modal/AddSportsBook'
import Plus from '@renderer/icons/plus'

export default function AddSportsBook() {
  const [openAddSportsBook, setOpenAddSportsBook] = useState(false)

  return (
    <Fragment>
      <button
        className={`${'bg-blue-color'} hover:opacity-90 text-sm w-[165px] h-[40px] rounded-[8px] text-white gap-[4px] flex items-center justify-center`}
        onClick={() => setOpenAddSportsBook(true)}
      >
        <Plus />
        <span className="ml-[4px]">Add SportsBook</span>
      </button>
      <AddSportsBookModal
        openAddSportsBook={openAddSportsBook}
        setOpenAddSportsBook={setOpenAddSportsBook}
      />
    </Fragment>
  )
}
