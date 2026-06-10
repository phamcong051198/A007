import { X } from 'lucide-react'

import { Button } from '../ui/button'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface ConfirmationProps {
  showAlertDialog: boolean
  setShowAlertDialog: (open: boolean) => void
  title: string
  messageError: string
  ReactElement: React.ReactElement
  actionYes: () => void
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  title,
  messageError,
  showAlertDialog,
  setShowAlertDialog,
  actionYes,
  ReactElement
}) => {
  if (!showAlertDialog) return null

  return (
    <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
      <AlertDialogContent className="gap-0 p-0 w-[400px] bg-white rounded-lg border-0 shadow-lg">
        {/* Header with close button */}
        <AlertDialogHeader className="relative p-6 pb-4">
          <button
            onClick={() => setShowAlertDialog(false)}
            className="absolute top-4 right-4  hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Icon and Title */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">{ReactElement}</div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold  mb-2">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-sm  leading-relaxed">
                {messageError}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Footer with buttons */}
        <AlertDialogFooter className="flex gap-3 p-6 pt-4">
          <Button
            className="flex-1  bg-white border-border-default hover:border-gray-500"
            variant="bordered-white"
            onClick={() => setShowAlertDialog(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={actionYes}>
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
