const fs = require('fs').promises
const path = require('path')
const util = require('util')

const bodyParser = require('body-parser')
const glob = util.promisify(require('glob'))
const express = require("express")
const next = require("next")

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

const dataPath = path.join(__dirname, `../data`)

async function inventoryReports() {
  const globPath = `${dataPath}/reports/*.{html,json,pdf}`
  const files = await glob(globPath)
  // const reportsManifestFile = await fs.readFile(`${dataPath}/reports.json`)
  // const reportsManifest = JSON.parse(reportsManifestFile.toString())
  const inventory = []

  files.forEach(file => {
    const match = file.match(/([\d\-\w]+)\.(\w+)$/)
    const reportId = match[1]
    const fileExt = match[2]
    const existing = inventory.find(d => d.reportId === reportId)

    if (!existing) {
      inventory.push({
        reportId,
        [fileExt]: true
      })
    } else {
      existing[fileExt] = true
    }
  })

  return inventory
}

async function saveReportJson(reportId, json) {
  const reportPath = `${dataPath}/reports/${reportId}.json`
  return fs.writeFile(reportPath, JSON.stringify(json, null, 2))
}

app.prepare().then(() => {
  const server = express()

  server.use(bodyParser.json())
  server.use(`/data`, express.static(dataPath))

  server.post(`/api/reports/:reportId`, async (req, res) => {
    const { body, params } = req
    const { reportId } = params
    await saveReportJson(reportId, body)
    return res.send(201)
  })

  server.get(`/api/reports`, async (req, res) => {
    const reports = await inventoryReports()
    return res.json(reports)
  })

  server.all(`*`, (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})