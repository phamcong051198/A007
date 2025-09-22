import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

type Theme = 'blue' | 'green' | 'purple'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-slate-300',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
        destructive:
          'bg-red-500 text-slate-50 shadow-sm hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90',
        outline:
          'border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        secondary:
          'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        link: 'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50',
        borderless: 'bg-transparent hover:bg-slate-100/10',
        'bordered-white': 'border border-gray-600 text-white hover:bg-gray-700/30',
        'plain-white': 'text-white bg-transparent'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'borderless'
    | 'bordered-white'
    | 'plain-white'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size, asChild = false, ...props }, ref) => {
    const buildTarget = import.meta.env.VITE_BUILD_TARGET
    const Comp = asChild ? Slot : 'button'

    let theme: Theme = 'blue'

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

    let themeClass = ''

    // Manually determine theme class based on variant and theme
    if (variant === 'default') {
      if (theme === 'blue') themeClass = 'bg-[#155EEF] text-white hover:bg-[#155EEF]/90'
      else if (theme === 'green') themeClass = 'bg-[#14B800] text-white hover:bg-[#14B800]/90'
      else if (theme === 'purple') themeClass = 'bg-[#7F56D9] text-white hover:bg-[#7F56D9]/90'
    } else if (variant === 'outline') {
      if (theme === 'blue')
        themeClass = 'border border-[#155EEF] text-[#155EEF] hover:bg-[#155EEF]/10'
      else if (theme === 'green')
        themeClass = 'border border-[#14B800] text-[#14B800] hover:bg-[#14B800]/10'
      else if (theme === 'purple')
        themeClass = 'border border-[#7F56D9] text-[#7F56D9] hover:bg-[#7F56D9]/10'
    } else if (variant === 'secondary') {
      if (theme === 'blue') themeClass = 'bg-[#D1E0FF] text-[#155EEF] hover:bg-[#D1E0FF]/80'
      else if (theme === 'green') themeClass = 'bg-[#D1FFD0] text-[#14B800] hover:bg-[#D1FFD0]/80'
      else if (theme === 'purple') themeClass = 'bg-[#E9D7FE] text-[#7F56D9] hover:bg-[#E9D7FE]/80'
    } else if (variant === 'ghost') {
      if (theme === 'blue') themeClass = 'text-[#155EEF] hover:bg-[#155EEF]/10'
      else if (theme === 'green') themeClass = 'text-[#14B800] hover:bg-[#14B800]/10'
      else if (theme === 'purple') themeClass = 'text-[#7F56D9] hover:bg-[#7F56D9]/10'
    } else if (variant === 'link') {
      if (theme === 'blue') themeClass = 'text-[#155EEF] underline-offset-4 hover:underline'
      else if (theme === 'green') themeClass = 'text-[#14B800] underline-offset-4 hover:underline'
      else if (theme === 'purple') themeClass = 'text-[#7F56D9] underline-offset-4 hover:underline'
    } else if (variant === 'destructive') {
      themeClass = 'bg-red-500 text-white hover:bg-red-500/90'
    } else if (variant === 'borderless') {
      // Button không có viền, không có background, nhưng có màu chữ theo theme
      if (theme === 'blue') themeClass = 'text-[#155EEF] hover:bg-[#155EEF]/5'
      else if (theme === 'green') themeClass = 'text-[#14B800] hover:bg-[#14B800]/5'
      else if (theme === 'purple') themeClass = 'text-[#7F56D9] hover:bg-[#7F56D9]/5'
    } else if (variant === 'bordered-white') {
      // Button có viền màu xám, chữ màu trắng
      themeClass = 'border'
    } else if (variant === 'plain-white') {
      // Button chỉ có màu chữ trắng, không border, không hover effect
      themeClass = 'text-white'
    }

    // Size classes
    let sizeClass = 'h-9 px-4 py-2' // default
    if (size === 'sm') sizeClass = 'h-8 rounded-md px-3 text-xs'
    else if (size === 'lg') sizeClass = 'h-10 rounded-md px-8'
    else if (size === 'icon') sizeClass = 'h-9 w-9'

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
          themeClass,
          sizeClass,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
