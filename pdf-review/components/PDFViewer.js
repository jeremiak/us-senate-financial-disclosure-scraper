import React, { useEffect, useState } from "react"
import { Document, Page } from "react-pdf"

const PDFViewer = ({ url }) => {
  const [rotation, setRotation] = useState(270)
  const [pageCount, setPageCount] = useState(0)
  const [zoom, setZoom] = useState(2.1)
  const pages = []

  for (var i = 1; i <= pageCount; i++) {
    pages.push(i)
  }

  function handleKeyUp(e) {
    const { key, shiftKey } = e

    if (!shiftKey) return

    if (key === "ArrowRight") {
      rotateClockwise(e)
    } else if (key === "ArrowLeft") {
      rotateCounterClockwise(e)
    } else if (key === "+") {
      zoomIn(e)
    } else if (key === "_") {
      zoomOut(e)
    }
  }

  function handleLoadSuccess(e) {
    const { numPages } = e._pdfInfo
    setPageCount(numPages)
  }

  function rotateCounterClockwise(e) {
    e.preventDefault()
    if (rotation === 0) return setRotation(270)
    setRotation(rotation - 90)
  }

  function rotateClockwise(e) {
    e.preventDefault()
    if (rotation === 270) return setRotation(0)
    setRotation(rotation + 90)
  }

  function zoomOut(e) {
    e.preventDefault()
    setZoom(zoom - 0.1)
  }

  function zoomIn(e) {
    e.preventDefault()
    setZoom(zoom + 0.1)
  }

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp, true)

    return () => {
      window.removeEventListener("keyup", handleKeyUp, true)
    }
  }, [handleKeyUp])

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-buttons">
        <button title="Rotate counter clockwise (hold shift and left arrow)" onClick={rotateCounterClockwise}>-90°</button>
        <button title="Rotate clockwise (hold shift and right arrow)" onClick={rotateClockwise}>90°</button>
        <button title="Zoom out (hold shift and minus)" onClick={zoomOut}>-</button>
        <button title="Zoom in (hold shift and plus)" onClick={zoomIn}>+</button>
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
