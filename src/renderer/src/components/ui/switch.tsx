import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

const SwitchCustom = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => {
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
    blue: 'data-[state=checked]:bg-[#155EEF]',
    green: 'data-[state=checked]:bg-[#14B800]',
    purple: 'data-[state=checked]:bg-[#7F56D9]'
  }

  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-[#373A41]',
        themeClasses[theme],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block h-[20px] w-[20px] rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitive.Root>
  )
})

SwitchCustom.displayName = SwitchPrimitive.Root.displayName

export { SwitchCustom }
