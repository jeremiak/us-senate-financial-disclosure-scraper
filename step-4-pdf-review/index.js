const fs = require('fs').promises
const path = require('path')
const util = require('util')

const bodyParser = require('body-parser')
const glob = util.promisify(require('glob'))
const fetch = require('isomorphic-fetch')
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

const githubApiBaseUrl = `https://api.github.com/repos/jeremiak/us-senate-financial-disclosure-data`
const githubHeaders = {
  Authorization: "token d79eb8558c93b17efad31513444c842edfd07d66"
}

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
  const commitsUrl = `${githubApiBaseUrl}/commits`
  const commitsReq = await fetch(commitsUrl)
  const commitsJson = await commitsReq.json()

  const { sha: latestSha } = commitsJson[0]

  const treeUrl = `${githubApiBaseUrl}/git/trees/${latestSha}`
  const treeReq = await fetch(treeUrl)
  const treeJson = await treeReq.json()
  const { tree: files } = treeJson

  // // const reportsManifestFile = await fs.readFile(`${dataPath}/reports.json`)
  // // const reportsManifest = JSON.parse(reportsManifestFile.toString())
  const inventory = []

  files.forEach(file => {
    const match = file.path.match(/([\d\-\w]+)\.(\w+)$/)
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
  let sha = null
  const encoded = Buffer.from(JSON.stringify(json, null, 2)).toString('base64')
  const fileName = `${reportId}.json`
  const url = `${githubApiBaseUrl}/contents/${fileName}`
  const getReq = await fetch(url)

  if (getReq.status !== 404) {
    const getJson = await getReq.json()
    sha = getJson.sha
  }

  console.log({ sha })

  const saveReq = await fetch(url, {
    method: `PUT`,
    headers: githubHeaders,
    body: JSON.stringify({
      message: `${sha ? 'Update to' : 'Create'} ${fileName}`,
      content: encoded,
      sha
    }),
  })

  const saveJson = await saveReq.json()

  return saveJson
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