import React from 'react';

export default function Table({ columns, data, emptyMessage = 'No hay registros disponibles' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-zinc-100/75 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="py-3 px-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200/80 text-zinc-700">
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="hover:bg-zinc-50/80 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="py-3.5 px-4 font-medium">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-zinc-400 font-medium">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

