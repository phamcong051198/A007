import AlertOctagon from '@renderer/icons/alert-octagon'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

export function ConfirmLogOut({ openConfirmLogOut, setOpenConfirmLogOut }) {
  const quitApp = () => {
    window.electron.ipcRenderer.send('QuitApp')
  }

  return (
    <AlertDialog open={openConfirmLogOut} onOpenChange={setOpenConfirmLogOut}>
      <AlertDialogContent className="rounded-[12px] h-[196px] w-[480px] border-none bg-black">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex">
            <AlertOctagon />
            <div className="ml-[16px] flex flex-col text-[#F7F7F7]">
              <div className="flex justify-between relative ">
                <p>Log out of all VIP accounts?</p>
                <button
                  className="absolute top-[-16px] right-[-17px] font-normal block w-8 h-8 leading-none text-[#85888E] hover:bg-gray-900 hover:rounded-full"
                  onClick={() => setOpenConfirmLogOut(false)}
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-[#94979C]">
                Are you sure you want to log out of all your VIP accounts?
              </p>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className=" flex gap-[14px] items-end">
          <AlertDialogCancel
            onClick={() => setOpenConfirmLogOut(false)}
            className="text-[#CECFD2] text-base block bg-transparent flex-1 w-[209px] h-[44px] hover:bg-transparent font-semibold border border-border-default hover:text-[#cecfd2d3]"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#F04438] text-base border-none block flex-1 w-[209px] h-[44px] font-semibold hover:bg-[#f04438e0]"
            onClick={quitApp}
          >
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
