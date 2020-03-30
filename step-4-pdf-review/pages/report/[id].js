import http from "isomorphic-fetch"
import React from "react"

import Annotator from '../../components/Annotator'
import PDFViewer from '../../components/PDFViewer'

const Page = ({ json, metadata, reportId }) => {
  const { firstName, lastName, reportLink, reportTitle } = metadata
  const title = reportTitle || `Report ${reportId}`
  return (
    <div>
      <h1>{title}</h1>
      <p>
        Filed by {firstName} {lastName}.
      </p>
      <p>
        Sourced from{" "}
        <a href={`https://efdsearch.senate.gov/${reportLink}`}>
          efdsearch.senate.gov
        </a>.
      </p>
      <div class="report-annotator-container">
        <div className="report-container">
          <PDFViewer reportId={reportId} />
        </div>
        <div className="annotator-container">
          <input type="checkbox" id="annotator-close-toggle" />
          <label for="annotator-close-toggle">X</label>
          <Annotator reportId={reportId} initialJson={json} />
        </div>
      </div>
    </div>
  )
}

Page.getInitialProps = async function({ req, query }) {
  const { id } = query
  const reportReq = await http(`http://localhost:3000/api/report/${id}`)
  const reportReqJson = await reportReq.json()
  const { json: jsonFileExists, metadata, reportId } = reportReqJson

  let json = {}

  if (jsonFileExists) {
    const jsonReq = await http(`http://localhost:3000/data/reports/${id}.json`)
    json = await jsonReq.json()
  }

  return {
    reportId,
    metadata: metadata || {},
    json
  }
}

export default Page
