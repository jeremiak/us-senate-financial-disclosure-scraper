const fs = require('fs').promises
const path = require('path')
const util = require('util')

const bodyParser = require('body-parser')
const glob = util.promisify(require('glob'))
const express = require("express")
const next = require("next")

const manifest = require('../data/reports.json')

const manifestById = {}
manifest.forEach(report => {
  const { reportLink } = report
  const reportIdMatch = reportLink.match(/([\d\w\-]+)\/+$/)
  const reportId = reportIdMatch[1]

  manifestById[reportId] = report
})

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

const dataPath = path.join(__dirname, `../data`)

async function inventoryReport(reportId) {
  const metadata = manifestById[reportId]
  const report = { metadata, reportId }
  const files = await glob(`${dataPath}/reports/${reportId}.*`)
  
  files.forEach(file => {
    const match = file.match(/([\d\-\w]+)\.(\w+)$/)
    const fileExt = match[2]

    report[fileExt] = true
  })

  return report
}

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
    const metadata = manifestById[reportId]

    if (!existing) {
      inventory.push({
        reportId,
        metadata,
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

  server.get(`/api/report/:reportId`, async (req, res) => {
    const { reportId } = req.params
    const report = await inventoryReport(reportId)
    return res.json(report)
  })

  server.post(`/api/report/:reportId`, async (req, res) => {
    const { body, params } = req
    const { reportId } = params
    await saveReportJson(reportId, body)
    return res.sendStatus(201)
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