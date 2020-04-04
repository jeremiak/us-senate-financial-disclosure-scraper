import React from 'react'

const Field = ({
  field,
  label,
  options = null,
  onChange,
  type,
  value,
}) => {

  if (type === 'select') {
    if (!options) throw new Error('A select field must have options')
    return (
      <>
        <label htmlFor={field}>{label}</label>
        <select defaultValue={value} id={field} onChange={onChange}>
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
      <input id={field} onChange={onChange} type={type} defaultValue={value} />
    </>
  )


}

export default Field