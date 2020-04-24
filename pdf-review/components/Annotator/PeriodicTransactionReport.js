import React, { useEffect, useRef } from "react"

import Field from "./Field"

const transactionFields = [
  { field: "transaction-date", label: "Transaction date", type: "date" },
  {
    field: "owner",
    label: "Owner",
    type: "select",
    options: ["Self", "Spouse", "Dependent child", "Joint"],
  },
  { field: "ticker", label: "Ticker", type: "text" },
  { field: "asset-name", label: "Asset name", type: "text" },
  {
    field: "transaction-type",
    label: "Transaction type",
    type: "select",
    options: ["Purchase", "Sale", "Exchange"],
  },
  {
    field: "amount",
    label: "Amount",
    type: "select",
    options: [
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
      "Over $50,000,000",
    ],
  },
]

const PTR = ({ onChange, data }) => {
  const addTransactionButtonEl = useRef(null)
  const newestTransactionDateEl = useRef(null)
  let transactions = []

  if (data.length > 0) {
    transactions = data[0].rows.map((d, i) => {
      if (!d._id) d._id = `${new Date()}-${i}`
      return d
    })
  }

  function addNewTransaction(e) {
    e.preventDefault()
    const newTransaction = {
      _id: new Date(),
    }
    const copy = transactions.slice()
    const lastDate =
      copy.length === 0 ? false : copy[copy.length - 1]["transaction-date"]

    transactionFields.forEach(({ field }) => {
      if (field === 'transaction-date' && lastDate) {
        newTransaction[field] = lastDate
        return
      }

      newTransaction[field] = ""
    })
    copy.push(newTransaction)

    onChange([{ heading: "Transactions", amended: false, rows: copy }])

    setTimeout(() => {
      if (newestTransactionDateEl && newestTransactionDateEl.current) {
        newestTransactionDateEl.current.focus()
      }
    }, 300)
  }

  function createUpdateTransactionHandler(transactionId, field) {
    return function (e) {
      const { value } = e.target
      const transaction = transactions.find((t) => t._id === transactionId)
      
      transaction[field] = value

      onChange([
        { heading: "Transactions", amended: false, rows: transactions },
      ])
    }
  }

  function createRemoveTransactionHandler(transactionId) {
    return function (e) {
      e.preventDefault()
      const withoutTransaction = transactions.filter(
        (t) => t._id !== transactionId
      )
      onChange([
        { heading: "Transactions", amended: false, rows: withoutTransaction },
      ])

      if (addTransactionButtonEl && addTransactionButtonEl.current) {
        addTransactionButtonEl.current.focus()
      }
    }
  }

  return (
    <form>
      <legend>Transaction data</legend>
      <p>Please read the document and add data for all the transactions.</p>
      {transactions.map((transaction, i) => (
        <fieldset key={transaction._id}>
          {transactionFields.map((field, fieldI) => {
            const isLastTransaction = i === transactions.length - 1
            const isFirstField = fieldI === 0
            const fieldData = transaction[field.field]

            return (
              <div key={field.field}>
                <Field
                  {...field}
                  ref={
                    isLastTransaction && isFirstField
                      ? newestTransactionDateEl
                      : null
                  }
                  onChange={createUpdateTransactionHandler(
                    transaction._id,
                    field.field
                  )}
                  value={fieldData}
                />
              </div>
            )
          })}
          <button
            className="cancel"
            onClick={createRemoveTransactionHandler(transaction._id)}
          >
            Remove
          </button>
        </fieldset>
      ))}
      <button
        class="primary"
        onClick={addNewTransaction}
        ref={addTransactionButtonEl}
      >
        Add a transaction
      </button>
    </form>
  )
}

export default PTR
