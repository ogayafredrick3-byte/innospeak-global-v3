export default function DataTable({ columns, rows, keyField = 'id' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-navy-100">
      <table className="min-w-full divide-y divide-navy-100 font-body text-sm">
        <thead className="bg-navy-50/60">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-50 bg-white">
          {rows.map((row) => (
            <tr key={row[keyField]} className="transition-colors hover:bg-navy-50/40">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-navy-800">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
