import React from 'react'

const PDFViewer = ({ reportId }) => {
  return (
    <embed
      src={`http://localhost:3000/data/reports/${reportId}.pdf`}
      height="800"
      type="application/pdf"
    />
  )
}

export default PDFViewer