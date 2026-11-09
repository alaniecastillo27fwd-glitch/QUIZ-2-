'use strict';

/**
 * src/controllers/materialesController.js
 * Controlador HTTP para gestión de materiales, stock y trazabilidad.
 */

const materialesService = require('../services/materialesService');

exports.listar = async (req, res, next) => {
  try {
    const materiales = await materialesService.listarMateriales();
    res.status(200).json({
      total: materiales.length,
      materiales
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerPorId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: 'El ID de material debe ser un número entero válido' });
    }

    const material = await materialesService.obtenerMaterialPorId(id);
    if (!material) {
      return res.status(404).json({ error: `Material con ID ${id} no encontrado` });
    }

    res.status(200).json(material);
  } catch (error) {
    next(error);
  }
};

exports.crear = async (req, res, next) => {
  try {
    // Whitelist defensiva contra mass assignment
    const {
      codigo,
      nombre,
      descripcion,
      unidad_medida,
      stock_minimo,
      stock_maximo,
      demanda_promedio,
      demanda_maxima,
      tiempo_entrega
    } = req.body;

    if (!codigo || !nombre) {
      return res.status(400).json({ error: 'El código y nombre del material son obligatorios' });
    }

    const nuevo = await materialesService.crearMaterial({
      codigo,
      nombre,
      descripcion,
      unidad_medida,
      stock_minimo,
      stock_maximo,
      demanda_promedio,
      demanda_maxima,
      tiempo_entrega
    });

    res.status(201).json({
      mensaje: 'Material registrado exitosamente',
      material: nuevo
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'El código del material ya existe' });
    }
    next(error);
  }
};

exports.obtenerStock = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID de material inválido' });
    }

    const data = await materialesService.obtenerMaterialPorId(id);
    if (!data) {
      return res.status(404).json({ error: `Material con ID ${id} no encontrado` });
    }

    res.status(200).json({
      id_material: data.id_material,
      codigo: data.codigo,
      nombre: data.nombre,
      unidad_medida: data.unidad_medida,
      inventario: data.inventario
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerHistorial = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID de material inválido' });
    }

    const trazabilidad = await materialesService.obtenerTrazabilidad(id);
    if (!trazabilidad) {
      return res.status(404).json({ error: `Material con ID ${id} no encontrado` });
    }

    res.status(200).json(trazabilidad);
  } catch (error) {
    next(error);
  }
};

