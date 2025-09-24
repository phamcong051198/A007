// ...existing code...
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
import TrashIcon from '@renderer/icons/trash'
import QuestionMarkCircle from '@renderer/icons/question-mark-circle'

function DeleteAccount({ deleteAccount }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <TrashIcon />
      </AlertDialogTrigger>

      {/* updated styling/layout to match other notification popups */}
      <AlertDialogContent className="gap-0 p-0 w-[440px] bg-black rounded-lg border-0 shadow-lg overflow-hidden">
        <AlertDialogHeader className="relative p-6 pb-4">
          {/* icon + title + description layout like notifications */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <QuestionMarkCircle className={`${'text-blue-color'} size-9`} />
              </div>
            </div>

            <div className="min-w-0">
              <AlertDialogTitle className="text-lg font-semibold mb-1 text-white">
                Confirmation
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-white">
                Are you sure you want to delete this account?
              </AlertDialogDescription>
            </div>

            {/* close X button kept visually similar to other popups */}
            <AlertDialogCancel className="border-none relative bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 shadow-none">
              <div className="flex justify-between relative ">
                <button
                  type="button"
                  className="absolute top-[-34px] right-[-39px] font-normal block w-8 h-8 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                >
                  ✕
                </button>
              </div>
            </AlertDialogCancel>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-3 p-6 pt-4">
          <div className="flex-1">
            <AlertDialogCancel className="w-full text-white h-10 bg-black rounded-md border border-border-default hover:bg-transparent hover:text-white hover:border-gray-700">
              Cancel
            </AlertDialogCancel>
          </div>
          <div className="flex-1">
            <button
              type="button"
              onClick={deleteAccount}
              className="w-full h-10 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteAccount
