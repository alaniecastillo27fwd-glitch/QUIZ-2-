import React from 'react';
import { FileText, Download } from 'lucide-react';
import Badge from '../common/Badge';
import { formatFechaLocal } from '../../services/inventoryCalculations.js';

export default function TrazabilidadTable({ movimientos = [] }) {
  const exportToCSV = () => {
    if (!movimientos.length) return;
    const headers = ['Fecha', 'Tipo', 'Material', 'Cantidad', 'Unidad', 'Origen', 'Destino', 'Documento', 'Usuario', 'Motivo'];
    const rows = movimientos.map((m) => [
      `"${formatFechaLocal(m.fecha, true)}"`,
      `"${m.tipo}"`,
      `"${m.materialNombre}"`,
      m.cantidad,
      `"${m.unidad}"`,
      `"${m.origen}"`,
      `"${m.destino}"`,
      `"${m.documentoReferencia}"`,
      `"${m.usuario}"`,
      `"${m.motivo || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_inventario_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Registro Tabular de Auditoría ({movimientos.length} eventos)
        </h4>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Fecha</th>
              <th className="py-2.5 px-3">Flujo</th>
              <th className="py-2.5 px-3">Material</th>
              <th className="py-2.5 px-3 text-right">Cantidad</th>
              <th className="py-2.5 px-3">Origen</th>
              <th className="py-2.5 px-3">Destino</th>
              <th className="py-2.5 px-3">Documento</th>
              <th className="py-2.5 px-3">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {movimientos.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80">
                <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                  {formatFechaLocal(m.fecha, true)}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <Badge variant={m.tipo} size="xs" />
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                  {m.materialNombre}
                </td>
                <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                  {m.cantidad} {m.unidad}
                </td>
                <td className="py-2.5 px-3 text-slate-600">{m.origen}</td>
                <td className="py-2.5 px-3 text-slate-900 font-semibold">{m.destino}</td>
                <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-800 font-bold">
                  {m.documentoReferencia}
                </td>
                <td className="py-2.5 px-3 text-slate-500">{m.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

