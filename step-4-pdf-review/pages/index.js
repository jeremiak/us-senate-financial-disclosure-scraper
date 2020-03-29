import http from 'isomorphic-fetch'
import React from 'react'

const Page = ({ reports }) => {
  return (
    <div>
      <h1>PDF Senate financial disclosure reports</h1>

      <style jsx>{`
        table {
          width: 80%;
        }
      `}</style>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Report ID</th>
            <th>PDF</th>
            <th>HTML</th>
            <th>JSON</th>
          </tr>
        </thead>
      </table>
      <tbody>
        {reports.map((report, i) => {
          return (
            <tr key={report.reportId}>
              <td>{i + 1}</td>
              <td>
                <a href={`/reports/${report.reportId}`}>
                  {report.reportId}
                </a>
              </td>
              <td>{report.pdf || "No"}</td>
              <td>{report.html || "No"}</td>
              <td>{report.json || "No"}</td>
            </tr>
          )
        })}
      </tbody>
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