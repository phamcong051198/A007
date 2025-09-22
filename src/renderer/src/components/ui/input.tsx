import * as React from 'react'

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  button?: {
    text: string
    onClick: () => void
  }
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, button, ...props }, ref) => {
    const buildTarget = import.meta.env.VITE_BUILD_TARGET

    let theme = 'blue'

    switch (buildTarget) {
      case 'BSoft':
        theme = 'blue'
        break
      case 'BSoft-switch':
        theme = 'green'
        break
      case 'BSoft-corners':
        theme = 'purple'
        break
      default:
        theme = 'blue'
    }

    const themeClasses = {
      blue: 'focus:border-[#155EEF] focus:ring-[#155EEF]',
      green: 'focus:border-[#14B800] focus:ring-[#14B800]',
      purple: 'focus:border-[#7F56D9] focus:ring-[#7F56D9]'
    }

    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-[#373A41]'

    return (
      <div className="w-full relative">
        <input
          className={cn(
            'flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus:outline-none focus:ring-1',
            button ? 'pr-[100px]' : '',
            themeClasses[theme],
            errorClasses,
            className
          )}
          ref={ref}
          {...props}
        />
        {button && (
          <div className="absolute right-0 top-0 h-full mr-2 flex items-center">
            <button
              type="button"
              className={cn(
                'border-l py-[5px] pl-4 text-sm font-semibold',
                theme === 'blue'
                  ? 'text-[#2970FF]'
                  : theme === 'green'
                    ? 'text-[#14B800]'
                    : 'text-[#7F56D9]'
              )}
              onClick={button.onClick}
            >
              {button.text}
            </button>
          </div>
        )}
        {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
