// ...existing code...
import { getThemeClass } from '@shared/common/constants'
import { Button } from './ui/button'
import { useState } from 'react'

export const PasswordChangeModal = ({
  account,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  handlePasswordSubmit,
  onClose
}: {
  account: { userName: string; expiredDate: string }
  currentPassword: string
  setCurrentPassword: (value: string) => void
  newPassword: string
  setNewPassword: (value: string) => void
  confirmPassword: string
  setConfirmPassword: (value: string) => void
  passwordError: string
  handlePasswordSubmit: (e: React.FormEvent) => Promise<void>
  onClose: () => void
}) => {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const EyeIcon = ({ open = true }: { open?: boolean }) =>
    open ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
        <path
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"></circle>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
        <path
          d="M1 1l22 22"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.82 21.82 0 0 1 4.11-5.13"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0C0E12] border border-[#22262F] rounded-lg w-full max-w-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#22262F] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-200">Change Password</h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400 mr-2">
              <div className="text-xs text-gray-400">Account</div>
              <div className={getThemeClass('text') + ' font-medium'}>{account.userName}</div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-200 p-1 rounded-md"
              onClick={onClose}
              type="button"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-6 md:border-r md:border-[#22262F]">
            <h3 className="text-sm text-gray-400 mb-3">Account Info</h3>

            <div className="grid grid-cols-2 gap-3 mb-3 items-center">
              <div className="text-xs text-gray-400">Account ID</div>
              <div className={getThemeClass('text') + ' text-sm'}>{account.userName}</div>

              <div className="text-xs text-gray-400">Expired Date</div>
              <div className={getThemeClass('text') + ' text-sm'}>{account.expiredDate}</div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Changing your password will require you to enter your current password. The new
              password should be at least 8 characters long.
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Current */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pr-10 px-3 py-2 bg-[#13161B] border border-[#22262F] rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-400"
                    aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                  >
                    <EyeIcon open={showCurrent} />
                  </button>
                </div>
              </div>

              {/* New */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pr-10 px-3 py-2 bg-[#13161B] border border-[#22262F] rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-400"
                    aria-label={showNew ? 'Hide new password' : 'Show new password'}
                  >
                    <EyeIcon open={showNew} />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  At least 8 characters, including uppercase letters, numbers, and special
                  characters.
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-10 px-3 py-2 bg-[#13161B] border border-[#22262F] rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-400"
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>
            </div>
            {passwordError && (
              <div className="bg-red-900/20 text-red-400 px-3 py-2 rounded-md mt-4 text-xs border border-red-800/30">
                {passwordError}
              </div>
            )}
          </div>

          {/* Footer - full width */}
          <div className="col-span-full px-6 py-4 border-t border-[#22262F] flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="mr-2 bg-transparent border-gray-400 text-gray-300 hover:bg-gray-700"
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" className="min-w-[96px]">
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
