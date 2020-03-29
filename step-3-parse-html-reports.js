/*

needs to handle a few different types of reports

does:
- periodic transaction reports (2f4e395e-7637-45c7-a85a-72823a87918c)

i think it works for:
- annual report (2f72a35a-adad-4555-8341-01eacbd507d3.html)
- annual report amendments (4b72e8be-ac7d-4e31-913b-cf5ba6dda160.html)
- annual report extensions (fbd4056a-7524-498c-ab2c-c0f65825d094.html)
- candidate report (2f291525-7cef-445a-841d-35d0ca75c68a.html)
*/

const fs = require('fs').promises

const cheerio = require('cheerio')
const glob = require('glob')
const { default: Queue } = require('p-queue')

function extractTables(html) {
  const $ = cheerio.load(html)

  const sections = $(`.card`)
    .toArray()
    .map(section => {

      const tableHeadRowSelector = `table thead tr`
      const tableBodyRowSelector = `table tbody tr`
      
      const heading = $(section).find("h3")
        .text()
        .trim()
      const tableHeadRows = $(section).find(tableHeadRowSelector)
      const tableBodyRows = $(section).find(tableBodyRowSelector)

      const tableColumns = tableHeadRows
        .find("th")
        .toArray()
        .map(th => {
          const text = $(th).text()
          return text
        })

      const rows = tableBodyRows.toArray().map(tr => {
        const row = {}

        $(tr)
          .find("td")
          .toArray()
          .forEach((td, i) => {
            row[tableColumns[i]] = $(td)
              .text()
              .trim()
          })

        return row
      })

      return {
        heading,
        rows 
      }
    })

  return sections
}

async function extractData(path) {
  console.log(`Extracting data from ${path}`)
  const file = await fs.readFile(path)
  const html = file.toString()
  const outputPath = path.replace('.html', '.json')
  const $ = cheerio.load(html)

  const reportTitleSelector = `h1`
  const reportFilerSelector = `h2.filedReport`
  const reportFiledDateSelector = `${reportFilerSelector} + p.muted`

  const reportTitle = $(reportTitleSelector).text().trim().replace(/\s+/g, ' ')
  const reportFiler = $(reportFilerSelector).text().trim().replace(/\s+/g, ' ')
  const reportFiledDate = $(reportFiledDateSelector).text().trim().replace(/\s+/g, ' ')
  
  const report = {
    title: reportTitle,
    filer: reportFiler,
    filedDate: reportFiledDate,
    data: extractTables(html),
  }

  await fs.writeFile(outputPath, JSON.stringify(report, null, 2))

  return
}

glob('./data/reports/*.html', (err, files) => {
  if (err) {
    console.error(err)
    return
  }
  const queue = new Queue({ concurrency: 1 })

  files.forEach(file => {
    queue.add(() => {
      return extractData(file)
    })
  })

  queue.onIdle().then(() => {
    console.log('All done')
  })
})