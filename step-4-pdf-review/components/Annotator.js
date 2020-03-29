import React from 'react'

const Annotator = ({ reportId }) => {
  function saveJson(e) {
    const textarea = document.querySelector("textarea")
    const url = `/api/reports/${reportId}`
    console.log({ url })

    http(url, {
      method: `POST`,
      headers: {
        "Content-Type": `application/json`
      },
      body: textarea.value
    }).then(response => {
      console.log("response", response)
    })
  }

  return (
    <div>
      <h2>Annotator goes here</h2>
      <textarea rows="40" cols="80"></textarea>
      <button onClick={saveJson}>Save</button>
    </div>
  )
 
}

export default Annotator