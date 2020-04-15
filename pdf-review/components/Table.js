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
                const isActionColumn = cell.column.Header === ""
                let cellContents

                if (isActionColumn) {
                  const status = row.cells.find(c => c.column.id === 'json')
                  const completed = status.value === 'Yes' ? false : true
                  console.log('herherherherherh')
                  console.log(status)
                  cellContents = (
                    <a class="button primary" href={cell.value}>
                      {completed ? 'Create' : 'Edit'}
                    </a>
                  )
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
