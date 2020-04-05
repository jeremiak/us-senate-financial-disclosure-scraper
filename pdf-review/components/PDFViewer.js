import React, { useState } from "react"
import { Document, Page } from "react-pdf"

const PDFViewer = ({ url }) => {
  const [rotation, updateRotation] = useState(0)
  const [pageCount, updatePageCount] = useState(0)
  const [zoom, updateZoom] = useState(1.1)
  const pages = []

  for (var i = 1; i <= pageCount; i++) {
    pages.push(i)
  }

  function handleLoadSuccess(e) {
    const { numPages } = e._pdfInfo
    updatePageCount(numPages)
  }

  function rotateCounterClockwise(e) {
    e.preventDefault()
    if (rotation === 0) return updateRotation(270)
    updateRotation(rotation - 90)
  }

  function rotateClockwise(e) {
    e.preventDefault()
    if (rotation === 270) return updateRotation(0)
    updateRotation(rotation + 90)
  }

  function zoomOut(e) {
    e.preventDefault()
    updateZoom(zoom - 0.1)
  }
  function zoomIn(e) {
    e.preventDefault()
    updateZoom(zoom + .1)
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-buttons">
        <button onClick={rotateCounterClockwise}>-90°</button>
        <button onClick={rotateClockwise}>90°</button>
        <button onClick={zoomOut}>-</button>
        <button onClick={zoomIn}>+</button>
      </div>
      <div className="pdf-viewer-document">
        <Document file={url} height={600} onLoadSuccess={handleLoadSuccess}>
          {pages.map((page) => (
            <Page
              height={300}
              pageNumber={page}
              renderMode="svg"
              rotate={rotation}
              scale={zoom}
            />
          ))}
        </Document>
      </div>
    </div>
  )
}

export default PDFViewer
