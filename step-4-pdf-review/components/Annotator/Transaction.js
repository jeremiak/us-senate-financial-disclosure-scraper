import React from 'react'

const transactors = ['Filer', 'Spouse', 'Dependent child', 'Joint']
const types = ['Purchase', 'Sale', 'Exchange']
const amountRanges = [
  "$1,001 - $15,000",
  "$15,001 - $50,000",
  "$50,001 - $100,000",
  "$100,001 - $250,000",
  "$250,001 - $500,000",
  "$500,001 - $1,000,000",
  "Over $1,000,000",
  "$1,000,001 - $5,000,000",
  "$5,000,001 - $25,000,000",
  "$25,000,001 - $50,000,000",
  "Over $50,000,000"
]

const Transaction = ({
  amountRange,
  assetId,
  date,
  onChange,
  onRemove,
  transactor,
  type,
}) => {
  const handleFieldChange = key => {
    return e => {
      e.preventDefault()
      const { value } = e.target
      onChange(key, value)
    }
  }

  const handleRemoveClick = e => {
    e.preventDefault()
    onRemove()
  }

  return (
    <div className="transaction">
      <div>
        <label>
          Transactor
          <select onChange={handleFieldChange("transactor")}>
            {transactors.map(t => (
              <option key={t} selected={transactor === t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Asset id
          <input
            type="text"
            onChange={handleFieldChange("assetId")}
            value={assetId}
          />
        </label>
        <label>
          Type
          <select onChange={handleFieldChange("type")}>
            {types.map(t => (
              <option key={t} selected={type === t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            onChange={handleFieldChange("date")}
            value={date}
          />
        </label>
        <label>
          Amount range
          <select onChange={handleFieldChange("amountRange")}>
            {amountRanges.map(range => (
              <option key={range} selected={range === amountRange}>
                {range}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button onClick={handleRemoveClick}>Remove</button>
    </div>
  )
}

export default Transaction