export default function BoxLabel({
  label,
  children,
  className,
  classNameLabel = 'bg-layout-color'
}) {
  return (
    <div className="relative h-full">
      <div className={`absolute top-[-10px] left-2  ${classNameLabel} `}>{label}</div>
      <div className={` w-1/2 h-full ${className} border border-zinc-300`}>{children}</div>
    </div>
  )
}
