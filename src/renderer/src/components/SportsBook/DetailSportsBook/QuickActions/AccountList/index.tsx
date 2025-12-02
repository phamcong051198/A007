import { useState } from 'react'

import { Main } from '@renderer/components/SportsBook/DetailSportsBook/QuickActions/AccountList/Main'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import { DropdownMenuItem } from '@renderer/components/ui/dropdown-menu'
import UsersICon from '@renderer/icons/users'

import { SportsBookType } from '@shared/common/types'

function AccountList({ sportsBook }: { sportsBook: SportsBookType }) {
  const [openModalSetting, setOpenModalSetting] = useState(false)

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          setOpenModalSetting(true)
        }}
        className="font-semibold cursor-pointer focus:text-white focus:bg-[#22262F] px-[16px] py-[8px] rounded-[4px]"
        onClick={() => setOpenModalSetting(true)}
      >
        Account List
      </DropdownMenuItem>

      <AlertDialog open={openModalSetting}>
        <AlertDialogContent className="p-0 px-[16px] rounded-[12px] h-5/6 w-11/12 min-w-[650px] border-border-default bg-black flex flex-col gap-0">
          <header className="flex pt-[16px]">
            <UsersICon />
            <div className="ml-[16px] flex flex-col">
              <div className="flex justify-between">
                <p className="text-lg font-semibold text-[#F7F7F7]"> Account List</p>
                <button
                  className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                  onClick={() => setOpenModalSetting(false)}
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-[#94979C]">
                View and update login details, proxy information, and scope settings for your
                accounts.
              </p>
            </div>
          </header>

          <main className="flex-1 h-[calc(100vh-150px)]">
            <Main setOpenModalSetting={setOpenModalSetting} sportsBook={sportsBook} />
          </main>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default AccountList
