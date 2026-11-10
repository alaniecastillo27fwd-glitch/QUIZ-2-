// Traducción entre el contrato de PostgreSQL/Sequelize y las vistas React.
const number = (value) => Number(value) || 0;

export function materialFromApi(m) {
  return {
    ...m,
    id: m.id_material,
    unidad: m.unidad_medida,
    categoria: m.categoria || 'General',
    ubicacionPrincipal: 'Bodega Central',
    demandaDiariaPromedio: number(m.demanda_promedio),
    demandaDiariaMaxima: number(m.demanda_maxima),
    tiempoEntregaDias: number(m.tiempo_entrega),
    stockActual: number(m.inventario?.stockActual ?? m.stockActual),
    stockMinimo: number(m.stock_minimo),
    stockMaximo: number(m.stock_maximo),
    precioUnitarioPromedio: number(m.precioUnitarioPromedio),
  };
}

export function materialToApi(m) {
  return {
    codigo: m.codigo?.trim().toUpperCase(),
    nombre: m.nombre?.trim(),
    descripcion: m.descripcion || null,
    unidad_medida: m.unidad,
    demanda_promedio: number(m.demandaDiariaPromedio),
    demanda_maxima: number(m.demandaDiariaMaxima),
    tiempo_entrega: number(m.tiempoEntregaDias),
    stock_minimo: number(m.stockMinimo),
    stock_maximo: number(m.stockMaximo),
  };
}

export function movimientoFromApi(m) {
  const tipo = m.tipo_movimiento?.toUpperCase() || m.tipo;
  return {
    ...m,
    id: m.id_movimiento,
    materialId: m.id_material,
    materialNombre: m.material?.nombre || m.materialNombre || '',
    unidad: m.material?.unidad_medida || m.unidad || '',
    tipo,
    cantidad: number(m.cantidad),
    fecha: m.fecha_movimiento || m.fecha,
    origen: m.ubicacionOrigen?.nombre || (tipo === 'ENTRADA' ? 'Proveedor' : 'Bodega Central'),
    destino: m.ubicacionDestino?.nombre || (tipo === 'SALIDA' ? 'Obra' : 'Bodega Central'),
    documentoReferencia: m.documento_referencia,
    tipoDocumento: tipo === 'ENTRADA' ? 'ORDEN_COMPRA' : tipo === 'SALIDA' ? 'VALE_SALIDA' : 'GUIA_TRASLADO',
    usuario: m.usuario?.nombre || `Usuario #${m.id_usuario}`,
    motivo: m.observaciones || '',
  };
}

export function ordenesFromApi(ordenes) {
  return ordenes.flatMap((oc) => (oc.detalles || []).map((d) => ({
    id: oc.id_orden,
    numeroOC: oc.numero_orden,
    materialId: d.id_material,
    materialNombre: d.material?.nombre || '',
    unidad: d.material?.unidad_medida || '',
    proveedor: oc.proveedor?.nombre || '',
    destino: 'Obra',
    fecha: oc.fecha_orden,
    cantidad: number(d.cantidad),
    precioUnitario: number(d.precio_unitario),
    total: number(d.cantidad) * number(d.precio_unitario),
    estado: oc.estado,
  })));
}

export function duplicadosFromApi(report, ordenes) {
  return (report.posiblesDuplicados || []).map((d, index) => {
    const findOrder = (o) => ordenes.find((oc) => oc.id === o.id_orden && oc.numeroOC === o.numero_orden);
    const a = findOrder(d.ordenPrincipal) || {};
    const b = findOrder(d.ordenSospechosa) || {};
    return {
      id: `dup-${index}-${d.ordenPrincipal.id_orden}-${d.ordenSospechosa.id_orden}`,
      ocA: a, ocB: b,
      material: a.materialNombre || b.materialNombre,
      proveedor: a.proveedor || b.proveedor,
      diferenciaHoras: number(d.diferenciaDias) * 24,
      impactoEconomicoCRC: number(d.montoRiesgoFuga),
      motivo: d.reglaAplicada,
      severidad: number(d.diferenciaCantidad) === 0 ? 'CRÍTICA' : 'ALERTA',
    };
  });
}
