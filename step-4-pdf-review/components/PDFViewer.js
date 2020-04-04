import React, { useState } from "react"
import { Document, Page } from "react-pdf"

const PDFViewer = ({ url }) => {
  const [rotation, updateRotation] = useState(0)
  const [pageCount, updatePageCount] = useState(0)
  const pages = []

  for (var i = 1; i <= pageCount; i++) {
    pages.push(i)
  }

  function handleLoadSuccess(e) {
    const { numPages } = e._pdfInfo
    updatePageCount(numPages)
  }

  function rotate(e) {
    e.preventDefault()
    if (rotation === 270) return updateRotation(0)
    updateRotation(rotation + 90)
  }

  return (
    <div>
      <button onClick={rotate}>Rotate</button>
      <Document file={url} height={600} onLoadSuccess={handleLoadSuccess}>
        {pages.map((page) => (
          <Page height={500} pageNumber={page} rotate={rotation} />
        ))}
      </Document>
    </div>
  )
}

export default PDFViewer
