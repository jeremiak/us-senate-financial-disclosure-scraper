const fs = require('fs').promises

const downloadImages = require('images-downloader').images
const mkdirp = require('mkdirp')
const puppeteer = require('puppeteer')
const { default: Queue } = require('p-queue')

const exec = require('./lib/exec')
const sleep = require('./lib/sleep')

const reports = require('./data/reports.json')

async function agreeWithStatement(page) {
  await page.goto(`https://efdsearch.senate.gov/search/home/`)

  await page.waitFor('#agree_statement')
  await page.click('#agree_statement')

  await page.waitFor('#filerTypeLabelSenator')
  await page.click('#filerTypeLabelSenator')
  await page.click('button[type="submit"].btn-primary')

  return
}

const reportIdRegex = /([\d\w\-]+)\/+$/
function determineReportTypeAndId(reportUrl) {
  const match = reportUrl.match(reportIdRegex)
  const id = match ? match[1] : 'UNCAPTURED'
  let type
  if (
    reportUrl.includes('view/ptr') ||
    reportUrl.includes('view/annual') ||
    reportUrl.includes('view/extension-notice')
  ) {
    type = 'html'
  } else if (reportUrl.includes('view/paper')) {
    type = 'pdf'
  } else {
    console.log({ reportUrl })
  }

  return { type, id }
}

async function downloadHtml(page, path) {
  const html = await page.evaluate(() =>
    document.documentElement.outerHTML
  )
  await fs.writeFile(path, html)
  return 
}

async function downloadPdfPageImages(page, dirPath) {
  const pdfUrls = await page.evaluate(() => {
    const imageUrls = []
    const images = document.querySelectorAll('img.filingImage')
    images.forEach(image => (
      imageUrls.push(image.getAttribute('src'))
    ))
    return imageUrls
  })

  await mkdirp(dirPath)
  const downloadedImages = await downloadImages(pdfUrls, dirPath)
  const imagePaths = downloadedImages.map(
    downloadedImage => downloadedImage.filename
  )

  const fileArgs = imagePaths.join(" ")
  const outFile = `${dirPath}.pdf`
  const cmd = `convert ${fileArgs} +compress -quality 100 ${outFile}`

  await exec(cmd)

  return
}

const queue = new Queue({ concurrency: 4 })

async function downloadReports() {
  const debugMode = false
  const options = debugMode ? { devtools: true, headless: false } : {}
  const browser = await puppeteer.launch(options)
  const page = await browser.newPage()
  await agreeWithStatement(page)

  const nextButtonSelector = `.paginate_button.next`
  await page.waitFor(nextButtonSelector)

  reports.forEach(r => {
    queue.add(async () => {
      const { type, id } = determineReportTypeAndId(r.reportLink)
      const downloadReportPath = `./data/reports/${id}.${type}`
      const downloadReportDirPath = `./data/reports/${id}`

      try {
        await fs.access(downloadReportPath)
        console.log(`Seems like ${downloadReportPath} exists, skipping`)
      } catch (e) {
        console.log(`Downloading report (${id})`)
        const reportPage = await browser.newPage()
        await reportPage.goto(`https://efdsearch.senate.gov${r.reportLink}`)

        if (type === 'html') {
          await downloadHtml(reportPage, downloadReportPath)
        } else if (type === 'pdf') {
          await downloadPdfPageImages(reportPage, downloadReportDirPath)
        }

        await reportPage.close()
      }

      const randomSleepDuration = Math.random() * 500
      await sleep(randomSleepDuration)

      return
    })
  })


  queue.onIdle().then(async () => {
    await browser.close()
    console.log('All done downloading reports')
  })
}

downloadReports()