import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/ui/button'

export default function ClearAccountsDialog({ onClear }: { onClear: () => void }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button className="outline-none hover:border-gray-700 border bg-layout-color hover:bg-inherit border-border-default py-0 px-8 leading-none h-7 font-bold w-24">
          Clear
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Content
          style={{ zIndex: 9999 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-layout-color rounded-md gap-0 p-0 w-72 h-[150px] border border-border-default shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]"
        >
          <AlertDialog.Title className="font-bold flex justify-between py-2 px-3 bg-layout-color text-base rounded-t-[8px]">
            Confirmation
          </AlertDialog.Title>
          <AlertDialog.AlertDialogDescription className="h-[50px] flex justify-center items-center flex-1 py-1">
            <span className="text-sm font-medium">Confirm delete this item?</span>
          </AlertDialog.AlertDialogDescription>
          <div className="h-[35px] gap-3 mt-4 rounded-b-lg p-0 flex items-center justify-between px-6">
            <AlertDialog.Cancel asChild>
              <Button className="outline-none hover:border-gray-700 border bg-layout-color hover:bg-inherit border-border-default py-0 px-8 leading-none h-7 font-bold w-24">
                Cancel
              </Button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <Button
                className={`${'bg-blue-color'} text-white w-24 border-none h-7 font-semibold  hover:bg-opacity-90 rounded-[8px]`}
                onClick={onClear}
              >
                Yes
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
