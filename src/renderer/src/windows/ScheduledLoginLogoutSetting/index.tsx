import React, { useEffect, useRef } from 'react'
import LoginSetting from '@renderer/components/LoginSchedulerSettingWindow/LoginSetting'
import SaveLoginSchedulerSetting from '@renderer/components/LoginSchedulerSettingWindow/SaveLoginSchedulerSetting'
import { LoginSchedulerSettingContextProvider } from '@renderer/context/LoginSchedulerSettingContext'
import { Button } from '@renderer/components/ui/button'

export default function ScheduledLoginLogoutSetting({ onClose }: { onClose?: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 min-w-[950px]"
      role="presentation"
      onClick={() => onClose?.()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Scheduled Login Logout"
        className="w-full max-w-[920px] bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0B0D10] border border-[#22262F] rounded-lg overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#0B0D10] border-b border-[#22262F]">
            <div className="flex items-center gap-3">
              <h3 className="text-sm text-gray-200 font-semibold">Scheduled Login / Logout</h3>
              <span className="text-xs text-gray-400">Schedule automated login and logout</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="text-gray-400 hover:text-gray-200 px-2 py-1 rounded-md"
                onClick={() => onClose?.()}
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <LoginSchedulerSettingContextProvider>
            <div className="p-5">
              <div className="flex gap-4">
                <div className="flex-1 h-full bg-[#0A0B0D] border border-[#17181A] rounded-md p-3 overflow-auto">
                  <div className="px-3 py-2 border-b border-[#17181A] mb-3">
                    <div className="text-xs text-gray-400">Login Schedule</div>
                  </div>
                  <LoginSetting type="Login" />
                </div>

                <div className="flex-1 h-full bg-[#0A0B0D] border border-[#17181A] rounded-md p-3 overflow-auto">
                  <div className="px-3 py-2 border-b border-[#17181A] mb-3">
                    <div className="text-xs text-gray-400">Logout Schedule</div>
                  </div>
                  <LoginSetting type="Logout" />
                </div>
              </div>

              {/* Footer - save / cancel */}
              <div className="mt-5 flex justify-end gap-3">
                <Button variant="bordered-white" onClick={() => onClose?.()}>
                  Cancel
                </Button>

                <div>
                  <SaveLoginSchedulerSetting />
                </div>
              </div>
            </div>
          </LoginSchedulerSettingContextProvider>
        </div>
      </div>
    </div>
  )
}
