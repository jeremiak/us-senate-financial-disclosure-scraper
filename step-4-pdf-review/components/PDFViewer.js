import React from 'react'

const PDFViewer = ({ url }) => {
  return (
    <embed
      src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${url}`}
      height="800"
      type="application/pdf"
    />
  )
}

export default PDFViewer