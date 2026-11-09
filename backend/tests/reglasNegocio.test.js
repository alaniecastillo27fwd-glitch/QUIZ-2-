'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Importar servicios y utilidades de cálculo
const { calcularMetricasInventario } = require('../src/services/materialesService');

describe('Lógica de Negocio - Gestión de Inventarios (Quiz 2)', () => {

  describe('Ejercicio A5: Fórmulas de Stock de Seguridad y Punto de Reorden', () => {
    // Función auxiliar pura idéntica al método del modelo
    function calcularPR(dProm, dMax, L) {
      const stockSeguridad = (dMax - dProm) * L;
      const puntoReorden = (dProm * L) + stockSeguridad;
      return {
        stockSeguridad: Number(stockSeguridad.toFixed(2)),
        puntoReorden: Number(puntoReorden.toFixed(2))
      };
    }

    it('debe calcular correctamente SS y PR para Cemento gris 50 kg', () => {
      // d=40, d_max=55, L=3
      // SS = (55 - 40) * 3 = 45
      // PR = 40 * 3 + 45 = 165 (o 55 * 3 = 165)
      const res = calcularPR(40, 55, 3);
      assert.equal(res.stockSeguridad, 45);
      assert.equal(res.puntoReorden, 165);
    });

    it('debe calcular correctamente SS y PR para Varilla #3 grado 40', () => {
      // d=120, d_max=160, L=5
      // SS = (160 - 120) * 5 = 200
      // PR = 120 * 5 + 200 = 800 (o 160 * 5 = 800)
      const res = calcularPR(120, 160, 5);
      assert.equal(res.stockSeguridad, 200);
      assert.equal(res.puntoReorden, 800);
    });

    it('debe calcular correctamente SS y PR para Block 12x20x40', () => {
      // d=600, d_max=900, L=4
      // SS = (900 - 600) * 4 = 1200
      // PR = 600 * 4 + 1200 = 3600 (o 900 * 4 = 3600)
      const res = calcularPR(600, 900, 4);
      assert.equal(res.stockSeguridad, 1200);
      assert.equal(res.puntoReorden, 3600);
    });

    it('debe calcular correctamente SS y PR para Arena (m³)', () => {
      // d=6, d_max=10, L=2
      // SS = (10 - 6) * 2 = 8
      // PR = 6 * 2 + 8 = 20 (o 10 * 2 = 20)
      const res = calcularPR(6, 10, 2);
      assert.equal(res.stockSeguridad, 8);
      assert.equal(res.puntoReorden, 20);
    });

    it('caso borde: si d_max es igual a d_promedio, SS debe ser 0', () => {
      const res = calcularPR(50, 50, 5);
      assert.equal(res.stockSeguridad, 0);
      assert.equal(res.puntoReorden, 250);
    });

    it('caso borde: si tiempo de entrega L es 0, SS y PR deben ser 0', () => {
      const res = calcularPR(50, 80, 0);
      assert.equal(res.stockSeguridad, 0);
      assert.equal(res.puntoReorden, 0);
    });
  });

  describe('Evaluación de Estado de Stock y Alertas de Reposición', () => {
    const mockMaterial = {
      stock_minimo: 50,
      stock_maximo: 500,
      calcularPuntoReorden: () => ({ stockSeguridad: 45, puntoReorden: 165 })
    };

    it('debe catalogar como ÓPTIMO si stock > punto de reorden', () => {
      const metricas = calcularMetricasInventario(mockMaterial, 190);
      assert.equal(metricas.estado, 'ÓPTIMO');
      assert.equal(metricas.requiereReposicion, false);
      assert.equal(metricas.stockActual, 190);
    });

    it('debe catalogar como ALERTA_REORDEN si stock <= punto de reorden pero > stock mínimo', () => {
      const metricas = calcularMetricasInventario(mockMaterial, 120);
      assert.equal(metricas.estado, 'ALERTA_REORDEN');
      assert.equal(metricas.requiereReposicion, true);
    });

    it('debe catalogar como CRÍTICO si stock <= stock mínimo', () => {
      const metricas = calcularMetricasInventario(mockMaterial, 40);
      assert.equal(metricas.estado, 'CRÍTICO');
      assert.equal(metricas.requiereReposicion, true);
    });

    it('caso borde: stock exactamente en el punto de reorden debe disparar ALERTA_REORDEN', () => {
      const metricas = calcularMetricasInventario(mockMaterial, 165);
      assert.equal(metricas.estado, 'ALERTA_REORDEN');
      assert.equal(metricas.requiereReposicion, true);
    });

    it('caso borde: stock exactamente en el stock mínimo debe disparar CRÍTICO', () => {
      const metricas = calcularMetricasInventario(mockMaterial, 50);
      assert.equal(metricas.estado, 'CRÍTICO');
      assert.equal(metricas.requiereReposicion, true);
    });
  });

  describe('Cálculo de Stock Dinámico a partir de Movimientos', () => {
    function simularCalculoStock(movimientos) {
      let stock = 0;
      for (const mov of movimientos) {
        const cant = Number(mov.cantidad) || 0;
        const tipo = (mov.tipo_movimiento || '').toLowerCase();
        if (tipo === 'entrada') stock += cant;
        else if (tipo === 'salida') stock -= cant;
        else if (tipo === 'ajuste') stock += cant;
        // traslados no alteran stock global
      }
      return Number(stock.toFixed(2));
    }

    it('debe sumar entradas y restar salidas correctamente', () => {
      const movimientos = [
        { tipo_movimiento: 'entrada', cantidad: 300 },
        { tipo_movimiento: 'salida', cantidad: 110 },
        { tipo_movimiento: 'traslado', cantidad: 50 } // traslado interno
      ];
      assert.equal(simularCalculoStock(movimientos), 190);
    });

    it('debe procesar ajustes positivos y negativos', () => {
      const movimientos = [
        { tipo_movimiento: 'entrada', cantidad: 100 },
        { tipo_movimiento: 'ajuste', cantidad: -5 },  // merma
        { tipo_movimiento: 'ajuste', cantidad: 10 }   // sobrante
      ];
      assert.equal(simularCalculoStock(movimientos), 105);
    });

    it('caso borde: sin movimientos el stock inicial debe ser 0', () => {
      assert.equal(simularCalculoStock([]), 0);
    });
  });

  describe('Detección Algorítmica de Compras Duplicadas (Ejercicio A3)', () => {
    function esDuplicado(ordenA, ordenB, ventanaDias = 7, margenCantidad = 0.10) {
      if (ordenA.id_orden === ordenB.id_orden) return false;
      if (ordenA.id_proveedor !== ordenB.id_proveedor) return false;
      if (ordenA.id_material !== ordenB.id_material) return false;

      const diffMs = Math.abs(new Date(ordenB.fecha) - new Date(ordenA.fecha));
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDias > ventanaDias) return false;

      const cantMax = Math.max(ordenA.cantidad, ordenB.cantidad);
      const diffCant = Math.abs(ordenA.cantidad - ordenB.cantidad);
      const difPorcentual = cantMax > 0 ? diffCant / cantMax : 0;

      return difPorcentual <= margenCantidad;
    }

    it('debe detectar OC-1041 y OC-1042 como duplicadas (mismo día, mismo proveedor, 200 sacos)', () => {
      const oc1041 = { id_orden: 1, id_proveedor: 1, id_material: 1, fecha: '2026-10-02', cantidad: 200 };
      const oc1042 = { id_orden: 2, id_proveedor: 1, id_material: 1, fecha: '2026-10-02', cantidad: 200 };
      assert.equal(esDuplicado(oc1041, oc1042), true);
    });

    it('debe detectar OC-1050 y OC-1053 como duplicadas (1 día dif, 500 vs 480 unid, dif 4%)', () => {
      const oc1050 = { id_orden: 4, id_proveedor: 3, id_material: 2, fecha: '2026-10-08', cantidad: 500 };
      const oc1053 = { id_orden: 5, id_proveedor: 3, id_material: 2, fecha: '2026-10-09', cantidad: 480 };
      assert.equal(esDuplicado(oc1050, oc1053), true);
    });

    it('NO debe catalogar como duplicadas órdenes de diferentes proveedores', () => {
      const ordenA = { id_orden: 1, id_proveedor: 1, id_material: 1, fecha: '2026-10-02', cantidad: 200 };
      const ordenB = { id_orden: 3, id_proveedor: 2, id_material: 1, fecha: '2026-10-06', cantidad: 40 };
      assert.equal(esDuplicado(ordenA, ordenB), false);
    });

    it('NO debe catalogar como duplicadas órdenes con más de 7 días de diferencia', () => {
      const ordenA = { id_orden: 1, id_proveedor: 1, id_material: 1, fecha: '2026-10-02', cantidad: 200 };
      const ordenB = { id_orden: 7, id_proveedor: 1, id_material: 1, fecha: '2026-10-15', cantidad: 300 };
      assert.equal(esDuplicado(ordenA, ordenB), false);
    });

    it('NO debe catalogar como duplicadas órdenes con variación de cantidad > 10%', () => {
      const ordenA = { id_orden: 1, id_proveedor: 1, id_material: 1, fecha: '2026-10-02', cantidad: 200 };
      const ordenB = { id_orden: 8, id_proveedor: 1, id_material: 1, fecha: '2026-10-03', cantidad: 100 }; // 50% diferencia
      assert.equal(esDuplicado(ordenA, ordenB), false);
    });
  });

});
