import React from "react"

import Field from "./Field"

const transactionFields = [
  { field: "transaction-date", label: "Transaction date", type: "date" },
  {
    field: "owner",
    label: "Owner",
    type: "select",
    options: ["Filer", "Spouse", "Dependent child", "Joint"],
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
      _id: new Date()
    }
    const copy = transactions.slice()

    transactionFields.forEach(({ field }) => (newTransaction[field] = ""))
    copy.push(newTransaction)
    
    onChange([
      { heading: "Transactions", amended: false, rows: copy },
    ])
  }

  function createUpdateTransactionHandler(transactionId, field) {
    return function(e) {
      const { value } = e.target
      const transaction = transactions.find(t => t._id === transactionId)

      transaction[field] = value

      onChange([
        { heading: "Transactions", amended: false, rows: transactions },
      ])
    }
  }

  function createRemoveTransactionHandler(transactionId) {
    return function(e) {
      e.preventDefault()
      const withoutTransaction = transactions.filter(t => t._id !== transactionId)
      onChange([{ heading: 'Transactions', amended: false, rows: withoutTransaction }])
    }
  }

  return (
    <form>
      <legend>Please enter the data from the table in the report</legend>
      {transactions.map((transaction, i) => (
          <fieldset key={transaction._id}>
            {transactionFields.map(field => {
              const fieldData = transaction[field.field]
              return (
                <div key={field.field}>
                  <Field
                    {...field}
                    onChange={createUpdateTransactionHandler(transaction._id, field.field)}
                    value={fieldData}
                  />
                </div>
              )
            })}
            <button onClick={createRemoveTransactionHandler(transaction._id)}>Remove</button>
          </fieldset>
        )
      )}
      <button onClick={addNewTransaction}>Add a transaction</button>
    </form>
  )
}

export default PTR
