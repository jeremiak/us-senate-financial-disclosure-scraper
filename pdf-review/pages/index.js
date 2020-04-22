import http from "isomorphic-fetch"
import React, { useMemo } from "react"

import { timeFormat } from "d3-time-format"

import Table from "../components/Table"

const formatDate = timeFormat('%Y-%m-%d')

const Page = ({ reports }) => {
  const state = useMemo(() => reports
    .filter(report => report.metadata)
    .sort(function (a, b) {
      const { reportDate: reportDateA } = a.metadata
      const { reportDate: reportDateB } = b.metadata

      const aDate = new Date(reportDateA)
      const bDate = new Date(reportDateB)

      if (aDate > bDate) return -1
      if (aDate < bDate) return 1
      return 0
    })
    .map((report) => {
      const { metadata, reportId, json } = report
      const date = new Date(metadata.reportDate)

      return {
        date: formatDate(date),
        senator: `${metadata.firstName} ${metadata.lastName}`,
        title: metadata.reportTitle,
        link: `/report/${reportId}`,
        json: json ? "Yes" : "No",
      }
    }), [reports.length])

  const randomPTRReport = useMemo(() => {
    const PTRReports = state.filter(report => report.title.includes("Periodic") && report.json === 'No')
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
      <p>Hey there, grab a report from below to see the data or help us digitize it. If you're just looking for a place to start, <a href={randomPTRReport.link}>click here :)</a>.</p>
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
