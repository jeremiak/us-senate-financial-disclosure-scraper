require('dotenv').config()
const bodyParser = require('body-parser')
const fetch = require('isomorphic-fetch')
const express = require("express")
const next = require("next")

const githubApiBaseUrl = `https://api.github.com/repos/jeremiak/us-senate-financial-disclosure-data`
const githubHeaders = {
  Authorization: `token ${process.env.GITHUB_TOKEN}`
}
const manifestById = {}
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

async function inventoryReport(reportId) {
  const metadata = manifestById[reportId]
  const report = {
    metadata,
    reportId,
  }

  const jsonFileName = `${reportId}.json`
  const jsonReq = await fetch(`${githubApiBaseUrl}/contents/reports/${jsonFileName}`, { headers: githubHeaders })
  let json = false

  if (jsonReq.status === 200) {
    json = await jsonReq.json()
    json = Buffer.from(json.content, "base64")
    json = JSON.parse(json)
  }

  report.json = json
  report.pdf = `https://raw.githubusercontent.com/jeremiak/us-senate-financial-disclosure-data/master/reports/${reportId}.pdf`

  return report
}

async function inventoryReports() {
  let latestSha = null
  const commitsUrl = `${githubApiBaseUrl}/commits`
  const commitsReq = await fetch(commitsUrl, { headers: githubHeaders })
  const commitsJson = await commitsReq.json()

  if (commitsJson && commitsJson[0]) {
    latestSha = commitsJson[0].sha
  }

  const treeUrl = `${githubApiBaseUrl}/git/trees/${latestSha}?recursive=true`
  const treeReq = await fetch(treeUrl, { headers: githubHeaders })
  const treeJson = await treeReq.json()
  const { tree: files } = treeJson
  const inventory = []

  files.forEach(file => {
    const match = file.path.match(/([\d\-\w]+)\.(\w+)$/)
    if (!match) return
    const reportId = match[1]
    const fileExt = match[2]
    const existing = inventory.find(d => d.reportId === reportId)
    const isPdf = fileExt.includes('pdf')
    const metadata = manifestById[reportId]

    if (!existing) {
      let f = {
        reportId,
        metadata,
        [fileExt]: true
      }
      if (isPdf) {
        f.pdfSha = file.sha
      }
      inventory.push(f)
    } else {
      existing[fileExt] = true
      if (isPdf) {
        existing.pdfSha = file.sha
      }
    }

    if (fileExt.includes('pdf')) {
      if (!existing) {

      }
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

app.prepare().then(async () => {
  const server = express()

  const manifestReq = await fetch(`${githubApiBaseUrl}/contents/reports.json`, { headers: githubHeaders })
  if (manifestReq.status === 200) {
    const manifestJson = await manifestReq.json()
    const manifest = JSON.parse(Buffer.from(manifestJson.content, "base64"))

    manifest.forEach(report => {
      const { reportLink } = report
      const reportIdMatch = reportLink.match(/([\d\w\-]+)\/+$/)
      const reportId = reportIdMatch[1]

      manifestById[reportId] = report
    })
  }

  server.use(bodyParser.json())

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