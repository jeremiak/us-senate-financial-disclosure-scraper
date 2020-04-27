import http from "isomorphic-fetch"
import orderBy from "lodash.orderby"
import React, { useMemo } from "react"

import { timeFormat } from "d3-time-format"

import Table from "../components/Table"

const formatDate = timeFormat("%Y-%m-%d")

const Page = ({ reports }) => {
  const state = useMemo(() => {
    const filtered = reports
      .filter((report) => report.metadata)
      .map((report) => {
        const { metadata, reportId, json } = report
        const { firstName, lastName, reportDate, reportTitle: title } = metadata
        const date = new Date(reportDate)
        let type = "ptr"

        if (title.includes("Report Due Date Extension")) {
          type = "extension"
        } else if (title.includes("Annual Report")) {
          type = "annual"
        }
        return {
          date: formatDate(date),
          senator: `${firstName} ${lastName}`,
          title,
          link: `/report/${reportId}`,
          json: json ? "Yes" : "No",
          type,
        }
      })

    const sorted = orderBy(
      filtered,
      ["type", "json", "date"],
      ["desc", "asc", "desc"]
    )

    return sorted
  }, [reports.length])

  const randomPTRReport = useMemo(() => {
    const PTRReports = state.filter(
      report => report.type === 'ptr' && report.json === "No"
    )
    const random = parseInt(Math.random() * PTRReports.length)
    return PTRReports[random]
  }, [state.length])

  const columns = [
    {
      Header: "Report date",
      accessor: "date",
      sortType: "basic",
    },
    {
      Header: "Senator",
      accessor: "senator",
      sortType: "basic",
    },
    {
      Header: "Report Title",
      accessor: "title",
      sortType: "basic",
    },
    {
      Header: "Link",
      accessor: "link",
      sortType: "basic",
    },
    {
      Header: "Has JSON",
      accessor: "json",
      sortType: "basic",
    },
  ]

  return (
    <div>
      <h1>PDF Senate financial disclosure reports</h1>
      <p>
        Hey there, grab a report from below to see the data or help us digitize
        it. If you're just looking for a place to start,{" "}
        <a href={randomPTRReport.link}>click here :)</a>.
      </p>
      <Table columns={columns} data={state} />
    </div>
  )
}

Page.getInitialProps = async function ({ req }) {
  const { apiHost } = req.locales
  const reports = await http(`${apiHost}/api/reports`)
  const json = await reports.json()
  const pdfReports = json.filter((report) => report.pdf)
  return { reports: pdfReports }
}

export default Page
