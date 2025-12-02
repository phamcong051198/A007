import React, { useEffect } from 'react'
import { X } from 'lucide-react'

import { cn } from '@renderer/lib/utils'

import { Button } from './button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerChildren?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  headerClassName,
  contentClassName,
  footerChildren
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  // Size variants
  const sizeClasses = {
    full: 'w-[95vw] max-h-[95vh]',
    lg: 'w-2xl',
    md: 'w-lg',
    sm: 'max-w-md',
    xl: 'w-[80vw]'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0C111DCC] backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative bg-[#0C0E12] border border-[#22262F] rounded-lg shadow-xl max-h-[90vh] flex flex-col',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              'flex items-center justify-between p-4 border-b border-[#22262F]',
              headerClassName
            )}
          >
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn('flex-1 overflow-y-auto', contentClassName)}>{children}</div>

        {/* Footer */}
        {footerChildren && <div className="border-t border-gray-600 p-4">{footerChildren}</div>}
      </div>
    </div>
  )
}

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footerChildren={
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-gray-500 text-white hover:bg-gray-700"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn(
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-300">{message}</p>
    </Modal>
  )
}

// Form Modal Component
interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  title: string
  children: React.ReactNode
  saveText?: string
  cancelText?: string
  isSaving?: boolean
  saveDisabled?: boolean
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  children,
  saveText = 'Save',
  cancelText = 'Cancel',
  isSaving = false,
  saveDisabled = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footerChildren={
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="bg-transparent border-gray-500 text-white hover:bg-gray-700"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onSave}
            disabled={saveDisabled || isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? 'Saving...' : saveText}
          </Button>
        </div>
      }
    >
      {children}
    </Modal>
  )
}

export { ConfirmModal, FormModal, Modal }
export type { ConfirmModalProps, FormModalProps, ModalProps }
