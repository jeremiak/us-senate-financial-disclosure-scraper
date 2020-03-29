const fs = require('fs').promises

const d3 = require('d3-dsv')
const glob = require('glob')
const kebabCase = require('lodash.kebabcase')
const { default: Queue } = require('p-queue')

glob('data/reports/*.json', async function (err, files) {
  if (err) {
    console.error(err)
    return
  }

  const queue = new Queue({ concurrency: 2 })

  async function p(path) {
    const file = await fs.readFile(path)
    const json = JSON.parse(file.toString())
    const filer = json.filer.match(/\((.*)\)/)
    const report = path.match(/\/([\w\d\-]+)\.json$/)
    const reportTitle = json.title
    
    if (!filer) {
      return
    }
    
    const reportId = report[1] 
    const filedDateMatch = json.filedDate.match(
      /(\d+\/\d+\/\d+) .+(\d+[:\d]*.+$)/
    )
    
    const filedDate = filedDateMatch[1]
    const filedTime = filedDateMatch[2]

    const transactions = []
    const transactionRows = json.data.find(d => d.heading.includes('Transactions'))

    transactionRows.rows.forEach(row => {
      const obj = {}

      Object.keys(row).forEach(key => {
        obj['report-id'] = reportId
        obj['report-title'] = reportTitle
        obj['filer'] = filer[1]
        obj['filed-date'] = filedDate
        obj['filed-time'] = filedTime
        obj[kebabCase(key)] = row[key]
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

  queue.onIdle().then(async () => {
    const transactions = d3.csvFormat(allTransactions.flat())
    await fs.writeFile("transactions.csv", transactions)
  })
})