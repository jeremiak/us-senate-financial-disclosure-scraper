import React from "react"

export default function About() {
  return (
    <div>
      <h1>About this project</h1>
      <p>
        The goal of this project is to ultimately create a machine readable,
        open dataset of financial transactions taken by US Senators while they
        are in office or candidates for office.
      </p>
      <p>
        The STOCK Act requires Senators to file financial disclosure reports and
        annual reports regarding their financial assets, income, and wealth. The
        Senate publishes these documents{" "}
        <a href="https://efdsearch.senate.gov/">on their website</a> but only as
        individual reports and not in any sort of machine readable format.
      </p>
      <p>
        Some of the reports are filed electronically, rendered as HTML, and
        therefore parsable. There are some cool projects that are working on
        parsing all of that data and making it a structured data set, such as{" "}
        <a href="https://senatestockwatcher.com/">Senate Stock Watcher</a>.
      </p>
      <p>
        However, some Senators still file their reports on paper, which are then
        scanned and displayed as PDFs. This project aims to create a corpus of
        JSON documents, one for each PDF report. This tool reads and writes data
        from{" "}
        <a href="https://github.com/jeremiak/us-senate-financial-disclosure-data/tree/master/reports">
          public Github repository
        </a>
        , so anybody can get the data. Maybe at some day in the future we'll
        compile it into a single document or CSV.
      </p>
      <p>
        All of the data and the code for this tool are licensed with{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">
          CC BY-SA 4.0
        </a>
      </p>
      <p>
        This little tool is currently made by{" "}
        <a href="https://www.jeremiak.com">Jeremia Kimelman</a> and{" "}
        <a href="http://www.miceover.com/">Marco Segreto</a>. We'd love it if
        you got in touch.
      </p>
    </div>
  )
}
