import { Fragment, useEffect, useMemo, useState } from 'react'
import { PlatformType } from '@shared/common/types'
import InformationCircle from '@renderer/icons/information-circle'
import { AlertDialog, AlertDialogContent } from '@renderer/components/ui/alert-dialog'
import BookOpenBorder from '@renderer/icons/book-open-border'
import SearchLg from '@renderer/icons/search-lg'

export default function AddSportsBookModal({ openAddSportsBook, setOpenAddSportsBook }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [notification, setNotification] = useState<boolean>(false)
  const [listPlatForm, setListPlatForm] = useState<PlatformType[]>([])
  const [platForm, setPlatForm] = useState<PlatformType>()

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.electron.ipcRenderer.invoke('GetListPlatform')

      setListPlatForm(data)
    }

    fetchData()

    return () => {
      window.electron.ipcRenderer.removeAllListeners('GetListPlatform')
    }
  }, [])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const filteredData = useMemo(
    () =>
      listPlatForm.filter((item) => {
        const cleanedUrl = item.url.replace(/^https?:\/\//, '').toLowerCase()
        return cleanedUrl.includes(searchTerm.toLowerCase())
      }),
    [listPlatForm, searchTerm]
  )

  const addInfoWeb = async (platform: PlatformType) => {
    const checkPlatform = await window.electron.ipcRenderer.invoke('AddPlatForm', platform)
    if (checkPlatform === 1) {
      setNotification(true)
      setPlatForm(platform)
    }
  }

  return (
    <Fragment>
      <AlertDialog open={openAddSportsBook} onOpenChange={setOpenAddSportsBook}>
        <AlertDialogContent className="p-0 rounded-[12px] h-3/6 w-6/12 min-w-[360px] border-border-default bg-black flex flex-col gap-0">
          <header>
            <div className="flex p-[18px]">
              <BookOpenBorder />
              <div className="ml-[16px] flex flex-col">
                <div className="flex justify-between">
                  <p className="text-lg font-semibold text-[#F7F7F7]">Add SportsBook</p>
                  <button
                    className="absolute top-[6px] right-[6px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                    onClick={() => setOpenAddSportsBook(false)}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-[#94979C]">
                  Keep track of your accounts across all platforms
                </p>
              </div>
            </div>
            <div className="bg-[#13161B] h-[45px] flex items-center justify-end px-[24px]">
              <div className="relative">
                <span className="absolute top-[9px] left-[12px]">
                  <SearchLg />
                </span>
                <input
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search"
                  className="h-[35px] w-[280px] bg-layout-color border border-border-default rounded-[8px] pl-9 pr-3 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-scroll">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-[#94979C]">
                  <th className="border-b border-border-default text-start font-semibold py-[8px] pl-[24px]">
                    Platform
                  </th>
                  <th className="border-b border-border-default text-start font-semibold py-[8px] pl-[24px]">
                    URL
                  </th>
                  <th className="border-b border-border-default text-start py-[8px] pl-[24px]" />
                </tr>
              </thead>
              <tbody>
                {filteredData.map((platform) => (
                  <tr key={platform.id} className="hover:bg-color-hover ">
                    <td className="border-b border-border-default text-start transition duration-300 text-[#F7F7F7] text-sm font-medium py-[8px] pl-[24px]">
                      {platform.name}
                    </td>
                    <td className="border-b border-border-default text-start transition duration-300 text-sm font-normal">
                      {platform.url}
                    </td>
                    <td
                      className="border-b border-border-default text-center transition duration-300 text-[#F7F7F7] text-sm font-semibold hover:underline decoration-white cursor-pointer"
                      onClick={() => {
                        addInfoWeb(platform)
                      }}
                    >
                      Add
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>
          <footer className="flex gap-[12px] justify-end px-[24px] py-[16px]">
            <button
              className={`${'bg-blue-color'} text-sm border-none block w-[80px] h-[40px] font-semibold  hover:bg-opacity-90 rounded-[8px]`}
              onClick={() => setOpenAddSportsBook(false)}
            >
              Exit
            </button>
          </footer>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={notification} onOpenChange={setNotification}>
        <AlertDialogContent className="gap-0 p-0 w-72 h-[150px] border-border-default bg-black">
          <header className="flex-1 p-2 text-sm font-medium">
            <span>Message</span>
            <button
              className="absolute top-[2px] right-[2px] font-normal block w-9 h-9 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
              onClick={() => setNotification(false)}
            >
              ✕
            </button>
          </header>
          <main className="flex-1 flex justify-center items-center pb-2">
            <InformationCircle className={`${'text-blue-color'} size-8 mr-1 `} />
            <span className="text-sm ">{platForm?.name} already added !</span>
          </main>
          <footer className="rounded-b-lg items-center flex justify-end pr-4 pb-2">
            <button
              className={`${'bg-blue-color'} h-[24px] w-[80px] font-semibold text-xs rounded-[6px] border-none hover:bg-opacity-90 `}
              onClick={() => setNotification(false)}
            >
              OK
            </button>
          </footer>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  )
}
