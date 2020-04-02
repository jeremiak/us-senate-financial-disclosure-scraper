import http from 'isomorphic-fetch'
import React from 'react'

const Page = ({ reports }) => {

  const state = reports.sort(function(a, b) {
    if (!a.metadata) return -1
    if (!b.metadata) return -1

    const { reportDate: reportDateA } = a.metadata
    const { reportDate: reportDateB } = b.metadata

    const aDate = new Date(reportDateA)
    const bDate = new Date(reportDateB)


    return bDate - aDate
  })
  // const [state, updateState] = useState(sorted)

  return (
    <div>
      <h1>PDF Senate financial disclosure reports</h1>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Report Date</th>
            <th>Report ID</th>
            <th>Report title</th>
            <th>PDF</th>
            <th>JSON</th>
          </tr>
        </thead>
        <tbody>
          {state.map((report, i) => {
            const { metadata = {}, reportId, pdf, json } = report
            return (
              <tr key={reportId}>
                <td>{i + 1}</td>
                <td>
                  {metadata.reportDate}
                </td>
                <td>
                  <a href={`/report/${reportId}`}>{reportId}</a>
                </td>
                <td>
                  {metadata && (
                    <>
                      <p>
                        <span>{metadata.firstName} {metadata.lastName}</span>
                      </p>
                      <p>
                        <em>{metadata.reportTitle}</em>
                      </p>
                    </>
                  )}
                </td>
                <td>{pdf ? "Yes" : "No"}</td>
                <td>{json ? "Yes" : "No"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

Page.getInitialProps = async function({ req }) {
  const { apiHost } = req.locales
  const reports = await http(`${apiHost}/api/reports`)
  const json = await reports.json()
  const pdfReports = json.filter(report => report.pdf)
  return { reports: pdfReports }
}

export default Page