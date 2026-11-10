import React from 'react';
import { Download } from 'lucide-react';
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
    <div className="bg-white dark:bg-evergreen rounded-2xl border-2 border-darkteal/20 dark:border-darkteal/50 shadow-xs overflow-hidden transition-colors">
      <div className="p-4 border-b-2 border-darkteal/15 dark:border-darkteal/40 flex items-center justify-between bg-softlinen/40 dark:bg-darkteal/40">
        <h4 className="text-xs font-black uppercase tracking-wider text-evergreen dark:text-softlinen">
          Registro Tabular de Auditoría ({movimientos.length} eventos)
        </h4>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-darkteal/30 hover:bg-softlinen/60 text-evergreen dark:text-softlinen text-xs font-black uppercase tracking-wider transition-colors active:scale-95"
        >
          <Download className="w-4 h-4 text-yellowgreen" />
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-softlinen/60 dark:bg-darkteal/60 border-b-2 border-darkteal/20 dark:border-darkteal/50 text-evergreen dark:text-softlinen font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Flujo</th>
              <th className="py-3 px-4">Material</th>
              <th className="py-3 px-4 text-right">Cantidad</th>
              <th className="py-3 px-4">Origen</th>
              <th className="py-3 px-4">Destino</th>
              <th className="py-3 px-4">Documento</th>
              <th className="py-3 px-4">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-darkteal/10 dark:divide-darkteal/40 text-evergreen dark:text-softlinen font-medium">
            {movimientos.map((m) => (
              <tr key={m.id} className="hover:bg-softlinen/30 dark:hover:bg-darkteal/30 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap text-darkteal dark:text-softlinen/80 font-bold text-xs">
                  {formatFechaLocal(m.fecha, true)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Badge variant={m.tipo} size="sm" />
                </td>
                <td className="py-3 px-4 font-bold text-evergreen dark:text-white whitespace-nowrap text-sm">
                  {m.materialNombre}
                </td>
                <td className="py-3 px-4 text-right font-black whitespace-nowrap text-sm">
                  <span className={m.tipo === 'ENTRADA' ? 'text-yellowgreen' : m.tipo === 'SALIDA' ? 'text-cayenne' : 'text-darkteal dark:text-softlinen'}>
                    {m.tipo === 'ENTRADA' ? '+' : m.tipo === 'SALIDA' ? '-' : '⇄'}{Number(m.cantidad).toLocaleString()}
                  </span>{' '}
                  <span className="text-xs text-darkteal/70 dark:text-softlinen/60 font-semibold">{m.unidad}</span>
                </td>
                <td className="py-3 px-4 text-xs font-semibold text-darkteal dark:text-softlinen/80">{m.origen}</td>
                <td className="py-3 px-4 text-xs font-bold text-evergreen dark:text-softlinen">{m.destino}</td>
                <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-evergreen dark:text-softlinen font-bold">
                  {m.documentoReferencia}
                </td>
                <td className="py-3 px-4 text-xs text-darkteal dark:text-softlinen/70 font-semibold">{m.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

