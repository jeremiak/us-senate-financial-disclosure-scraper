import React, { useState } from 'react'

import Transaction from './Transaction'

const inputs = [
  {
    type: "select",
    field: "type",
    label: "Type",
    options: [
      "Periodic transaction report",
      "Periodic transaction report amendment",
      "Annual report",
      "Annual report due date extension"
    ]
  },
  {
    type: "text",
    field: "filer",
    label: "Filer"
  },
  {
    type: "date",
    field: "filedDate",
    label: "Filed date"
  },
  {
    type: "time",
    field: "filedTime",
    label: "Filed time"
  }
]

const Annotator = ({ initialJson, reportId }) => {
  const [isSaving, updateSaving] = useState(false)
  const [state, updateState] = useState({
    type: initialJson.type || "",
    // title: initialJson.title || "",
    filer: initialJson.filer || "",
    filedDate: initialJson.filedDate || "",
    filedTime: initialJson.filedTime || "",
    data: initialJson.data || []
  })

  const transactions = state.data.find(d => d.heading.includes('Transaction')) || {
    heading: 'Transactions',
    rows: [],
  }

  function addNewTransaction(e) {
    e.preventDefault()
    transactions.rows.push({
      _created: new Date()
    })
    mergeDataByHeading(transactions)
  }

  function createInputHandler(field) {
    return function(e) {
      mergeState({ [field]: e.target.value })
    }
  }

  function createRemoveTransactionHandler(i) {
    return function(e) {
      const { heading, rows } = transactions
      const nextRows = rows.filter((transaction, ii) => {
        return i !== ii
      })

      mergeDataByHeading({
        heading,
        rows: nextRows
      })
    }
  }

  function mergeDataByHeading(toMerge) {
    const { heading } = toMerge
    let headingExists = false
    const nextData = state.data.map(d => {
      if (d.heading === heading) {
        headingExists = true
        return toMerge
      }

      return d
    })

    if (!headingExists) {
      nextData.push(toMerge)
    }
    
    mergeState({ data: nextData })
  }

  function mergeState(toMerge) {
    const nextState = Object.assign({}, state, toMerge)
    updateState(nextState)
  }

  function save() {
    const url = `/api/report/${reportId}`

    updateSaving(true)
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stateToJson()
    })
      .then(() => {
        updateSaving(false)
      })
      .catch(err => {
        console.error(err)
        updateSaving(false)
      })
  }

  function stateToJson() {
    const dataKeysToRemove = ['_created']
    const modifiedData = state.data.map(d => {
      const { heading, rows } = d
      const modifiedRows = rows.map(row => {
        const copy = Object.assign({}, row)

        dataKeysToRemove.forEach(key => {
          delete copy[key]
        })

        return copy
      })

      return { heading, rows: modifiedRows }
    })
    const toJson = Object.assign({}, state, { data: modifiedData })
    return JSON.stringify(toJson, null, 2)
  }

  function updateTransactionRow(i) {
    return function(key, value) {
      transactions.rows[i][key] = value
      mergeDataByHeading(transactions)
    }
  }

  return (
    <div className="annotator">
      <form>
        <legend>Report information</legend>
        {inputs.map(input => {
          const { field, label, options, type } = input

          return (
            <div>
              <label key={field} for={field}>
                {label}
              </label>
              {type === "select" ? (
                <select onChange={createInputHandler(field)}>
                  <option>--</option>
                  {options.map(option => (
                    <option key={option} selected={option === state[field]}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  id={field}
                  onChange={createInputHandler(field)}
                  value={state[field]}
                />
              )}
            </div>
          )
        })}
      </form>
      <form>
        <legend>Transactions ({transactions.rows.length})</legend>
        {transactions.rows.map((transaction, i) => (
          <Transaction
            key={transaction._created}
            amountRange={transaction.amountRange}
            assetId={transaction.assetId}
            date={transaction.date}
            onChange={updateTransactionRow(i)}
            onRemove={createRemoveTransactionHandler(i)}
            transactor={transaction.transactor}
            type={transaction.type}
          />
        ))}
        <button onClick={addNewTransaction}>Add transaction</button>
      </form>
      <details>
        <summary>See as JSON</summary>
        <textarea rows="20" cols="70" disabled={true} value={stateToJson()} />
      </details>
      <button className="btn-primary" onClick={save} disabled={isSaving}>
        {isSaving ? "Saving... " : "Save"}
      </button>
    </div>
  )
}

export default Annotator