import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@renderer/components/ui/alert-dialog'
import QuestionMarkCircle from '@renderer/icons/question-mark-circle'
import Xmark from '@renderer/icons/x-mark'
const isBSoft = import.meta.env.VITE_BUILD_TARGET === 'BSoft'

export default function DeletePlatform({ sportsBook }) {
  const removePlatform = (namePlatform: string) => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.includes(namePlatform)) {
        sessionStorage.removeItem(key)
        i--
      }
    }
    window.electron.ipcRenderer.send('DeletePlatform', namePlatform)
  }
  return (
    <div className="flex">
      <AlertDialog>
        <AlertDialogTrigger>
          <div className="border border-transparent p-[5px] hover:rounded-full hover:bg-gray-800 transition-all duration-800 ease-in-out">
            <Xmark className="text-red-500 cursor-pointer stroke-2 stroke-current" />
          </div>
        </AlertDialogTrigger>

        {/* updated styling/layout to match other notification popups */}
        <AlertDialogContent className="gap-0 p-0 w-[420px] bg-black rounded-lg border-0 shadow-lg overflow-hidden">
          <AlertDialogHeader className="relative p-6 pb-4">
            {/* icon + title + description layout like notifications */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <QuestionMarkCircle
                    className={`${isBSoft ? 'text-blue-color' : 'text-purple-color '} size-9`}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <AlertDialogTitle className="text-lg font-semibold mb-1 text-white">
                  Confirmation
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-white">
                  Are you sure you want to close [{sportsBook.platform}]?
                </AlertDialogDescription>
              </div>

              {/* close X button kept visually similar to other popups */}
              <AlertDialogCancel className="border-none relative bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 shadow-none">
                <div className="flex justify-between relative ">
                  <button
                    type="button"
                    className="absolute top-[-36px] right-[-48px] font-normal block w-8 h-8 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                  >
                    ✕
                  </button>
                </div>
              </AlertDialogCancel>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex gap-3  p-6 pt-4">
            <div className="flex-1">
              <AlertDialogCancel className="w-full text-white h-10 bg-black rounded-md border border-border-default hover:bg-transparent hover:text-white hover:border-gray-700">
                Cancel
              </AlertDialogCancel>
            </div>

            <div className="flex-1">
              <button
                type="button"
                onClick={() => removePlatform(sportsBook.platform)}
                className="w-full h-10 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* <AlertDialog>
        <AlertDialogTrigger>
          <div className=" border border-transparent  hover:rounded-full hover:bg-gray-700 p-[5px] ">
            <Xmark className="text-red-500 cursor-pointer  stroke-2 stroke-current " />
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="gap-0 p-0 w-96 h-[150px]  border-gray-400 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
          <AlertDialogHeader>
            <AlertDialogTitle className=" flex justify-between p-2 bg-blue-50 text-sm rounded-t-lg">
              Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className=" flex justify-center items-center flex-1 py-1 ">
              <QuestionMarkCircle className="text-blue-500  mr-1" />
              <span className="text-black text-sm font-medium">
                Are you sure you want to close [{sportsBook.platform}]?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rounded-b-lg p-0 bg-gray-100  flex items-center justify-between px-12">
            <AlertDialogCancel
              className="h-6 w-20 bg-white text-black font-semibold rounded border border-gray-400 hover:border-blue-400 hover:bg-white"
              onClick={() => removePlatform(sportsBook.platform)}
            >
              Yes
            </AlertDialogCancel>
            <AlertDialogCancel className="h-6 w-20 bg-white text-black font-semibold rounded border border-gray-400 hover:border-blue-400 hover:bg-white ">
              No
            </AlertDialogCancel>
            <AlertDialogCancel className="h-6 w-20 bg-white text-black font-semibold rounded border border-gray-400 hover:border-blue-400 hover:bg-white">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  )
}
