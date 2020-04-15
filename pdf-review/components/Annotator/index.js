import React, { useState } from "react"

import Field from './Field'
import PTR from './PeriodicTransactionReport'

import senators from './senators'
/*

part 1 - charity donations
part 2 - income
part 3 - financial assets and unearned income
part 4 - financial transactions
part 5 - gifts
part 6 - travel
part 7 - liabilities
part 8 - reportable position
part 9 - outside arrangements
part 10 - first report?

*/

const toplineFields = [
  {
    type: "select",
    field: "type",
    label: "Type",
    options: [
      "Periodic transaction report",
      "Periodic transaction report amendment",
      "Annual report",
      "Annual report amendment",
      "Annual report due date extension",
    ],
  },
  {
    type: "select",
    field: "filer",
    label: "Filer",
    options: senators,
  },
  {
    type: "date",
    field: "filed-date",
    label: "Filed date",
  },
  {
    type: "time",
    field: "filed-time",
    label: "Filed time",
  },
]

const Annotator = ({ initialJson, reportId }) => {
  const [isSaving, updateSaving] = useState(false)
  const [state, updateState] = useState({
    type: initialJson.type || "",
    title: initialJson.title || "",
    filer: initialJson.filer || "",
    'filed-date': initialJson['filed-date'] || "",
    'filed-time': initialJson['filed-time'] || "",
    data: initialJson.data || [],
  })


  function createInputHandler(field) {
    return function (e) {
      const nextState = Object.assign({}, state, { [field]: e.target.value })
      updateState(nextState)
    }
  }

  function upsertData(data) {
    const nextState = Object.assign({}, state, { data })
    updateState(nextState)
  }

  function stateToJson() {
    const copy = JSON.parse(JSON.stringify(state))

    copy.data.forEach(d => {
      d.rows.forEach(dd => {
        delete dd._id
      })
    })

    return JSON.stringify(copy, null, 2)
  }

  async function save() {
    const url = `/api/report/${reportId}`

    updateSaving(true)

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stateToJson(),
      })
      updateSaving(false)
    } catch (e) {
      console.error(err)
      updateSaving(false)
    }
  }

  return (
    <div className="annotator">
      <form>
        <legend>Report information</legend>
        {toplineFields.map((input) => {
          const { field, label, options, type } = input

          return (
            <Field
              key={field}
              field={field}
              label={label}
              onChange={createInputHandler(field)}
              options={options}
              type={type}
              value={state[field]}
            />
          )
        })}
      </form>
      <PTR onChange={upsertData} isAmended={false} data={state.data} />
      <details>
        <summary>See as JSON</summary>
        <textarea className="code" rows="20" cols="70" disabled={true} value={stateToJson()} />
      </details>
      <button className="primary" onClick={save} disabled={isSaving}>
        {isSaving ? "Saving... " : "Save"}
      </button>
    </div>
  )
}

export default Annotator
