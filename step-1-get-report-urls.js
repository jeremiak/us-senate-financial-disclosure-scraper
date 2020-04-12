const fs = require('fs').promises

const puppeteer = require('puppeteer')

async function agreeWithStatement(page) {
  await page.goto(`https://efdsearch.senate.gov/search/home/`)

  await page.waitFor('#agree_statement')
  await page.click('#agree_statement')

  await page.waitFor('#filerTypeLabelSenator')
  await page.click('#filerTypeLabelSenator')
  await page.click('button[type="submit"].btn-primary')

  return
}

async function getReportUrls () {
  const debugMode = false
  const options = debugMode ? { devtools: true, headless: false } : {}
  const browser = await puppeteer.launch(options)
  const page = await browser.newPage()
  await agreeWithStatement(page)

  const nextButtonSelector = `.paginate_button.next`
  await page.waitFor(nextButtonSelector)

  const scrapeData = await page.evaluate((sel) => {
    const data = []

    function inPage(done) {
      const nextButton = document.querySelector(sel)
      const containsDisabledClass = nextButton.classList.contains(`disabled`)
      const table = document.querySelector('#filedReports')
      const rows = table.querySelectorAll('tbody tr')

      rows.forEach(row => {
        const cells = row.querySelectorAll('td')
        const firstName = cells[0].innerText
        const lastName = cells[1].innerText
        const office = cells[2].innerText
        const reportDate = cells[4].innerText

        const reportAnchor = cells[3].querySelector('a')
        const reportLink = reportAnchor.getAttribute('href')
        const reportTitle = reportAnchor.innerText

        data.push({
          lastName,
          firstName,
          office,
          reportDate,
          reportTitle,
          reportLink,
        })
      })

      if (!containsDisabledClass) {
        nextButton.click()
        setTimeout(() => {
          inPage(done)
        }, 500)
      } else {
        done()
      }

    }

    return new Promise((resolve, reject) => {
      inPage(() => {
        resolve(data)
      })
    })

  }, nextButtonSelector)

  await browser.close()
  await fs.writeFile('./data/reports.json', JSON.stringify(scrapeData, null, 2))
  console.log('All done with step 1, created data/reports.json')
}

console.log('Trying to get a list of all available reports for current senators')
getReportUrls()