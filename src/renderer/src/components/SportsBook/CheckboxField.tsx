import React from 'react'
import { Checkbox } from '@renderer/components/ui/checkbox'

const CheckboxField = ({ id, checked, onChange, className }) => {
  return (
    <div className={className}>
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
export default React.memo(CheckboxField)
