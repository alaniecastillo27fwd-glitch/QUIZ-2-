'use strict';

/**
 * seeders/20261109000001-datos-semilla-quiz.js
 * Carga de datos semilla oficiales del Quiz 2 (Parte A y Parte B - Constructora Del Valle S.A.)
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Usuarios
    const usuarios = await queryInterface.bulkInsert(
      'usuarios',
      [
        {
          nombre: 'Eiker Abarca',
          correo: 'eiker@constructora.cr',
          rol: 'bodega',
          activo: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Juan Pérez (Compras)',
          correo: 'compras@constructora.cr',
          rol: 'compras',
          activo: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'María Rodríguez (Finanzas)',
          correo: 'finanzas@constructora.cr',
          rol: 'finanzas',
          activo: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      { returning: true }
    );

    // 2. Proveedores
    const proveedores = await queryInterface.bulkInsert(
      'proveedores',
      [
        { nombre: 'Proveedor A (Contrato Vigente)', telefono: '2222-1111', correo: 'ventas@proveedora.com', activo: true, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Proveedor B', telefono: '2222-2222', correo: 'ventas@proveedorb.com', activo: true, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Proveedor C', telefono: '2222-3333', correo: 'ventas@proveedorc.com', activo: true, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Proveedor D', telefono: '2222-4444', correo: 'ventas@proveedord.com', activo: true, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Proveedor E', telefono: '2222-5555', correo: 'ventas@proveedore.com', activo: true, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Proveedor F', telefono: '2222-6666', correo: 'ventas@proveedorf.com', activo: true, created_at: new Date(), updated_at: new Date() }
      ],
      { returning: true }
    );

    // 3. Ubicaciones
    const ubicaciones = await queryInterface.bulkInsert(
      'ubicaciones',
      [
        { nombre: 'Bodega Central', tipo: 'bodega', direccion: 'San José, Central', activo: true, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Obra Oreamuno', tipo: 'obra', direccion: 'Cartago, Oreamuno', activo: true, created_at: new Date(), updated_at: new Date() },
        { nombre: 'Taller Mantenimiento', tipo: 'mantenimiento', direccion: 'Heredia', activo: true, created_at: new Date(), updated_at: new Date() }
      ],
      { returning: true }
    );

    // 4. Materiales (con datos exactos del Ejercicio A5)
    // Cemento: d_prom=40, d_max=55, L=3 -> PR = 55*3 = 165
    // Varilla: d_prom=120, d_max=160, L=5 -> PR = 160*5 = 800
    // Block: d_prom=600, d_max=900, L=4 -> PR = 900*4 = 3600
    // Arena: d_prom=6, d_max=10, L=2 -> PR = 10*2 = 20
    const materiales = await queryInterface.bulkInsert(
      'materiales',
      [
        {
          codigo: 'CEM-GRIS-50',
          nombre: 'Cemento gris 50 kg',
          descripcion: 'Saco de cemento uso general 50 kg',
          unidad_medida: 'saco',
          stock_minimo: 50.00,
          stock_maximo: 500.00,
          demanda_promedio: 40.00,
          demanda_maxima: 55.00,
          tiempo_entrega: 3,
          activo: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          codigo: 'VAR-3-G40',
          nombre: 'Varilla #3 grado 40',
          descripcion: 'Hierro de refuerzo 3/8 x 6 m',
          unidad_medida: 'unidad',
          stock_minimo: 200.00,
          stock_maximo: 2000.00,
          demanda_promedio: 120.00,
          demanda_maxima: 160.00,
          tiempo_entrega: 5,
          activo: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          codigo: 'BLO-12-20-40',
          nombre: 'Block 12 x 20 x 40',
          descripcion: 'Bloque de concreto para mampostería',
          unidad_medida: 'unidad',
          stock_minimo: 500.00,
          stock_maximo: 5000.00,
          demanda_promedio: 600.00,
          demanda_maxima: 900.00,
          tiempo_entrega: 4,
          activo: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          codigo: 'ARE-M3',
          nombre: 'Arena (m³)',
          descripcion: 'Arena de río lavada por metro cúbico',
          unidad_medida: 'm3',
          stock_minimo: 5.00,
          stock_maximo: 50.00,
          demanda_promedio: 6.00,
          demanda_maxima: 10.00,
          tiempo_entrega: 2,
          activo: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      { returning: true }
    );

    // 5. Órdenes de compra del Ejercicio A3 (con casos de duplicación probados)
    await queryInterface.bulkInsert('ordenes_compra', [
      {
        numero_orden: 'OC-1041',
        id_proveedor: 1, // Prov A
        id_usuario: 1,
        fecha_orden: '2026-10-02',
        estado: 'recibida',
        observaciones: 'Compra de cemento Obras',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        numero_orden: 'OC-1042',
        id_proveedor: 1, // Prov A (Mismo proveedor, misma fecha, mismo artículo -> DUPLICADO)
        id_usuario: 1,
        fecha_orden: '2026-10-02',
        estado: 'recibida',
        observaciones: 'Compra de cemento Obras (posible duplicado)',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        numero_orden: 'OC-1047',
        id_proveedor: 2, // Prov B
        id_usuario: 2,
        fecha_orden: '2026-10-06',
        estado: 'recibida',
        observaciones: 'Compra cemento mantenimiento',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        numero_orden: 'OC-1050',
        id_proveedor: 3, // Prov C
        id_usuario: 1,
        fecha_orden: '2026-10-08',
        estado: 'recibida',
        observaciones: 'Varilla Obras',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        numero_orden: 'OC-1053',
        id_proveedor: 3, // Prov C (Varilla 480 unid, fecha cercana 09/10 -> DUPLICADO CON OC-1050)
        id_usuario: 1,
        fecha_orden: '2026-10-09',
        estado: 'recibida',
        observaciones: 'Varilla Obras (posible duplicado)',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 6. Líneas de detalle de órdenes
    await queryInterface.bulkInsert('detalle_orden_compra', [
      { id_orden: 1, id_material: 1, cantidad: 200, precio_unitario: 6450.00, created_at: new Date(), updated_at: new Date() },
      { id_orden: 2, id_material: 1, cantidad: 200, precio_unitario: 6450.00, created_at: new Date(), updated_at: new Date() },
      { id_orden: 3, id_material: 1, cantidad: 40, precio_unitario: 7100.00, created_at: new Date(), updated_at: new Date() },
      { id_orden: 4, id_material: 2, cantidad: 500, precio_unitario: 2150.00, created_at: new Date(), updated_at: new Date() },
      { id_orden: 5, id_material: 2, cantidad: 480, precio_unitario: 2150.00, created_at: new Date(), updated_at: new Date() }
    ]);

    // 7. Movimientos para generar los stocks del Ejercicio A5:
    // Cemento actual: 190 sacos (Entrada 200 - Salida 10)
    // Varilla actual: 850 unidades (Entrada 980 - Salida 130)
    // Block actual: 2800 unidades (Entrada 3000 - Salida 200)
    // Arena actual: 14 m3 (Entrada 20 - Salida 6) -> Arena y Block están BAJO el punto de reorden (Alertas!)
    await queryInterface.bulkInsert('movimientos', [
      { id_material: 1, id_usuario: 1, tipo_movimiento: 'entrada', cantidad: 200, fecha_movimiento: '2026-10-02 08:00:00Z', id_ubicacion_destino: 1, id_detalle_orden: 1, documento_referencia: 'OC-1041', created_at: new Date(), updated_at: new Date() },
      { id_material: 1, id_usuario: 1, tipo_movimiento: 'salida', cantidad: 10, fecha_movimiento: '2026-10-03 10:00:00Z', id_ubicacion_origen: 1, documento_referencia: 'VALE-001', created_at: new Date(), updated_at: new Date() },
      { id_material: 2, id_usuario: 1, tipo_movimiento: 'entrada', cantidad: 980, fecha_movimiento: '2026-10-08 09:00:00Z', id_ubicacion_destino: 1, id_detalle_orden: 4, documento_referencia: 'OC-1050', created_at: new Date(), updated_at: new Date() },
      { id_material: 2, id_usuario: 1, tipo_movimiento: 'salida', cantidad: 130, fecha_movimiento: '2026-10-10 14:00:00Z', id_ubicacion_origen: 1, documento_referencia: 'VALE-002', created_at: new Date(), updated_at: new Date() },
      { id_material: 3, id_usuario: 1, tipo_movimiento: 'entrada', cantidad: 3000, fecha_movimiento: '2026-10-01 07:00:00Z', id_ubicacion_destino: 1, documento_referencia: 'OC-1030', created_at: new Date(), updated_at: new Date() },
      { id_material: 3, id_usuario: 1, tipo_movimiento: 'salida', cantidad: 200, fecha_movimiento: '2026-10-05 11:00:00Z', id_ubicacion_origen: 1, documento_referencia: 'VALE-003', created_at: new Date(), updated_at: new Date() },
      { id_material: 4, id_usuario: 1, tipo_movimiento: 'entrada', cantidad: 20, fecha_movimiento: '2026-10-01 08:30:00Z', id_ubicacion_destino: 1, documento_referencia: 'OC-1025', created_at: new Date(), updated_at: new Date() },
      { id_material: 4, id_usuario: 1, tipo_movimiento: 'salida', cantidad: 6, fecha_movimiento: '2026-10-04 15:00:00Z', id_ubicacion_origen: 1, documento_referencia: 'VALE-004', created_at: new Date(), updated_at: new Date() }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('movimientos', null, {});
    await queryInterface.bulkDelete('detalle_orden_compra', null, {});
    await queryInterface.bulkDelete('ordenes_compra', null, {});
    await queryInterface.bulkDelete('materiales', null, {});
    await queryInterface.bulkDelete('ubicaciones', null, {});
    await queryInterface.bulkDelete('proveedores', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};

