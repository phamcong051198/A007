import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')

const SwitchCustom = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => {
  const theme = 'blue'
  const themeClasses = {
    blue: 'data-[state=checked]:bg-[#FF0000]'
  }

  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-[18px] w-[34px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-[#373A41]',
        themeClasses[theme],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block h-[16px] w-[16px] data-[state=checked]:translate-x-[14px] rounded-full bg-white shadow-lg ring-0 transition-transform  data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitive.Root>
  )
})

SwitchCustom.displayName = SwitchPrimitive.Root.displayName

export { SwitchCustom }
