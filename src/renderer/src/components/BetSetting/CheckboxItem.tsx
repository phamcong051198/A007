import React from 'react'

interface CheckboxItemProps {
  id: string
  label: string
  checked: boolean
  disabled: boolean
  onChange: () => void
}
const CheckboxItem: React.FC<CheckboxItemProps> = ({ id, label, checked, disabled, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      <input
        type="checkbox"
        id={id}
        className="cursor-pointer"
        disabled={disabled}
        checked={checked}
        onChange={onChange}
      />
      <label
        htmlFor={id}
        className={`cursor-pointer select-none ${disabled ? 'text-gray-400' : 'text-black'}`}
      >
        {label}
      </label>
    </div>
  )
}

export default React.memo(CheckboxItem)
