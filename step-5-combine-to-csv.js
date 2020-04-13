const fs = require('fs').promises

const d3 = require('d3-dsv')
const glob = require('glob')
const kebabCase = require('lodash.kebabcase')
const { default: Queue } = require('p-queue')

console.log('Starting to find all the JSON files and combine them into CSVs')
glob('data/reports/*.json', async function (err, files) {
  if (err) {
    console.error(err)
    return
  }

  const queue = new Queue({ concurrency: 2 })

  function parseFilerName(filer) {
    return filer.match(/\((.*)\)/)
  }

  async function p(path) {
    const file = await fs.readFile(path)
    const json = JSON.parse(file.toString())
    const filer = parseFilerName(json.filer)
    const report = path.match(/\/([\w\d\-]+)\.json$/)
    const reportTitle = json.title
    
    if (path.includes("150EDC44-0E54-48AA-9107-AEA667615811")) {
      debugger
    }
    else {
      debugger
    }


    if (!filer) {
      return
    }
    
    const reportId = report[1]     
    const filedDate = json["filed-date"]
    const filedTime = json["filed-time"]

    const transactions = []
    const transactionRows = json.data.find(d => d.heading.includes('Transactions'))

    transactionRows.rows.forEach(row => {
      const obj = {
        'report-id': reportId,
        'report-title': reportTitle,
        'filer': filer[1],
        'filed-date': filedDate,
        'filed-time': filedTime,
      }

      Object.keys(row).forEach(key => {
        obj[kebabCase(key)] = row[key].replace(/\s+/g, ' ')
      })

      transactions.push(obj)
    })

    return { transactions }
  }


  const allTransactions = []
  files.forEach(file => {
    queue.add(async () => {
      const data = await p(file)
      if (!data) return

      const { transactions } = data
      allTransactions.push(transactions)
    })
  })

  console.log("Found 'em, writing to disk")
  queue.onIdle().then(async () => {
    const transactions = d3.csvFormat(allTransactions.flat())
    await fs.writeFile("data/output/transactions.csv", transactions)
    console.log(`All done, created:\n * transactions.csv (${transactions.length} rows)`)
  })
})