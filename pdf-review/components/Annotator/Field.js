import React, { forwardRef } from 'react'

const Field = ({
  field,
  label,
  options = null,
  onChange,
  type,
  value,
}, ref) => {

  if (type === 'select') {
    if (!options) throw new Error('A select field must have options')
    return (
      <>
        <label htmlFor={field}>{label}</label>
        <select defaultValue={value} id={field} onChange={onChange} ref={ref}>
          <option value="">--</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </>
    )
  }

  return (
    <>
      <label htmlFor={field}>{label}</label>
      <input
        id={field}
        onChange={onChange}
        type={type}
        defaultValue={value}
        ref={ref}
      />
    </>
  )


}

export default forwardRef(Field)