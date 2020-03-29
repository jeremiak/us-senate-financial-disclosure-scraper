import http from "isomorphic-fetch"
import React from "react"

import Annotator from '../../components/Annotator'
import PDFViewer from '../../components/PDFViewer'

const Page = ({ reportId }) => {
  return (
    <div>
      <h1>Report: {reportId}</h1>

      <style jsx>{`
        main {
          display: flex;
        }

        .report-container,
        .annotator-container {
          border: 1px solid black;

          flex-grow: 1;
          width: 50%;
        }

        .report-container {
          display: flex;
          justify-content: center;
        }

        .annotator-container button {
          display: block;
        }
      `}</style>

      <main>
        <div className="report-container">
          <PDFViewer reportId={reportId} />
        </div>
        <div className="annotator-container">
          <Annotator reportId={reportId} />
        </div>
      </main>
    </div>
  )
}

Page.getInitialProps = async function({ req, query }) {
  // const reports = await http(`http://localhost:3000/api/reports`)
  // const json = await reports.json()

  const { id } = query
  return { reportId: id }
}

export default Page
