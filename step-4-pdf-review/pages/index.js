import http from 'isomorphic-fetch'
import React from 'react'

const Page = ({ reports }) => {
  return (
    <div>
      <h1>PDF Senate financial disclosure reports</h1>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Report ID</th>
            <th>Report title</th>
            <th>PDF</th>
            <th>JSON</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, i) => {
            const { metadata, reportId, pdf, json } = report
            return (
              <tr key={reportId}>
                <td>{i + 1}</td>
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

Page.getInitialProps = async function() {
  const reports = await http(`http://localhost:3000/api/reports`)
  const json = await reports.json()
  const pdfReports = json.filter(report => report.pdf)
  return { reports: pdfReports }
}

export default Page