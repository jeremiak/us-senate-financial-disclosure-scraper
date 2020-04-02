import http from "isomorphic-fetch"
import React, { useState } from "react"

import Annotator from '../../components/Annotator'
import PDFViewer from '../../components/PDFViewer'

const Page = ({ json, metadata, pdf, reportId }) => {
  const { firstName, lastName, reportLink, reportTitle } = metadata
  const title = reportTitle || `Report ${reportId}`

  const [state, updateState] = useState({
    isDragging: false,
    left: 0,
    top: 0,
  })

  function handleDragEnd(event) {
    event.preventDefault()
    const data = event.dataTransfer.getData("text/plain").split(',')
    const left = event.screenX - parseInt(data[0], 10)
    const top = event.screenY - parseInt(data[1], 10)

    updateState({ isDragging: false, top, left })
  } 

  function handleDragStart(event) {
    const { x, y } = event.target.getBoundingClientRect()
    event.dataTransfer.setData('text/plain', `${x},${y}`)

    const nextState = Object.assign({}, state, {
      isDragging: true,
    })
    updateState(nextState)
  } 

  function handleDragOver(event) {
    event.preventDefault()
    return false
  }

  return (
    <div onDragOver={handleDragOver}>
      <h1>{title}</h1>
      <p>
        Filed by {firstName} {lastName}.
      </p>
      <p>
        Sourced from{" "}
        <a href={`https://efdsearch.senate.gov/${reportLink}`}>
          efdsearch.senate.gov
        </a>
        .
      </p>
      <div className="report-annotator-container">
        <div className="report-container">
          <PDFViewer url={pdf} />
        </div>
        <div
          className="annotator-container"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{
            borderColor: state.isDragging ? "black" : "transparent",
            position: "absolute",
            left: `${state.left}px`,
            top: `${state.top}px`
          }}
        >
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
  const { json, metadata, pdf, reportId } = reportReqJson

  return {
    reportId,
    metadata: metadata || {},
    json,
    pdf,
  }
}

export default Page
