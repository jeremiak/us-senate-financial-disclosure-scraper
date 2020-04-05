import { useTable, useSortBy } from "react-table"

const Table = ({ columns, data }) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  )

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render("Header")}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                const isLinkColumn = cell.column.Header === "Link"
                let cellContents

                if (isLinkColumn) {
                  cellContents = <a href={cell.value}>{cell.value}</a>
                } else {
                  cellContents = cell.render('Cell')
                }

                return <td {...cell.getCellProps()}>{cellContents}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default Table
