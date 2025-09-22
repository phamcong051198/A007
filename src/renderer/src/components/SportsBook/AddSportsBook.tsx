import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import Plus from '@renderer/icons/plus'
import AddSportsBookModal from '@renderer/components/Modal/AddSportsBook'

const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

export default function AddSportsBook() {
  const [openAddSportsBook, setOpenAddSportsBook] = useState(false)

  return (
    <Fragment>
      <button
        className={`${isBSoft ? 'bg-blue-color' : 'bg-purple-color'} hover:opacity-90 text-sm w-[165px] h-[40px] rounded-[8px] text-white gap-[4px] flex items-center justify-center`}
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
