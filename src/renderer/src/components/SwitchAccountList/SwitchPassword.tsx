import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ConfirmSwitchDialog({ onConfirm }: { onConfirm: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const handleConfirm = () => {
    setConfirmOpen(false)
    onConfirm()
    setSuccessOpen(true)
  }

  return (
    <>
      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Trigger asChild>
          <Button
            variant="outline"
            className="outline-none border bg-white text-black border-solid hover:bg-inherit border-gray-400 hover:border-blue-500 py-0 px-8 leading-none h-7 font-bold w-40"
          >
            Switch Password
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/50 fixed inset-0 z-20" />
          <Dialog.Content className="bg-white rounded-lg shadow-lg p-6 w-96 fixed top-1/3 left-1/2 transform -translate-x-1/2 z-30">
            <Dialog.Title className="text-lg font-bold">Confirmation</Dialog.Title>
            <Dialog.Description className="mt-2">
              Confirm to switch Password and Expired Password?
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleConfirm}>
                Yes
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={successOpen} onOpenChange={setSuccessOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/50 fixed inset-0 z-20" />
          <Dialog.Content className="bg-white rounded-lg shadow-lg p-6 w-96 fixed top-1/3 left-1/2 transform -translate-x-1/2 z-30">
            <Dialog.Title className="text-lg font-bold">Success</Dialog.Title>
            <Dialog.Description className="mt-2">
              Password switched successfully!
            </Dialog.Description>
            <div className="mt-4 flex justify-end">
              <Button variant="default" onClick={() => setSuccessOpen(false)}>
                OK
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
