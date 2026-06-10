// ...existing code...
import React from 'react'
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

interface AlertErrorProps {
  showAlertDialog: boolean
  setShowAlertDialog: (open: boolean) => void
  title: string
  messageError: string
  ReactElement?: React.ReactElement
}

export const NotificationError: React.FC<AlertErrorProps> = ({
  showAlertDialog,
  setShowAlertDialog,
  title,
  messageError,
  ReactElement
}) => {
  if (!showAlertDialog) return null

  return (
    <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
      <AlertDialogContent className="gap-0 p-0 w-[380px] bg-white  rounded-lg border-0 shadow-lg">
        <AlertDialogHeader className="relative p-6 pb-4">
          <button
            onClick={() => setShowAlertDialog(false)}
            className="absolute top-4 right-4  hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                {ReactElement ? (
                  ReactElement
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                      fill="#FEE2E2"
                    />
                    <path
                      d="M12 8v5"
                      stroke="#DC2626"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="16.2" r="0.9" fill="#DC2626" />
                  </svg>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <AlertDialogTitle className="text-lg font-semibold  mb-1">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-sm  leading-relaxed">
                {messageError}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-3 p-6 pt-4">
          <Button
            className="flex-1 bg-transparent border-[1px] border-border-default  hover:border-gray-600 "
            variant="bordered-white"
            onClick={() => setShowAlertDialog(false)}
          >
            Close
          </Button>
          {/* Nếu cần action thêm, bạn có thể thêm nút khác ở đây */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default React.memo(NotificationError)
