'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Material extends Model {
    static associate(models) {
      Material.hasMany(models.DetalleOrdenCompra, {
        foreignKey: 'id_material',
        as: 'detallesOrden'
      });
      Material.hasMany(models.Movimiento, {
        foreignKey: 'id_material',
        as: 'movimientos'
      });
    }

    /**
     * Calcula dinámicamente el Punto de Reorden (PR):
     * PR = d * L + SS, donde SS = (d_max - d_prom) * L
     * Por lo tanto: PR = d_max * L
     */
    calcularPuntoReorden() {
      const dProm = Number(this.demanda_promedio) || 0;
      const dMax = Number(this.demanda_maxima) || 0;
      const L = Number(this.tiempo_entrega) || 0;
      const stockSeguridad = (dMax - dProm) * L;
      const puntoReorden = (dProm * L) + stockSeguridad;
      return {
        stockSeguridad: Number(stockSeguridad.toFixed(2)),
        puntoReorden: Number(puntoReorden.toFixed(2))
      };
    }
  }

  Material.init(
    {
      id_material: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      codigo: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: { msg: 'El código de material ya está registrado' }
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre del material es obligatorio' }
        }
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      unidad_medida: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'unidad'
      },
      stock_minimo: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      stock_maximo: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      demanda_promedio: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      demanda_maxima: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      tiempo_entrega: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Material',
      tableName: 'materiales',
      underscored: true,
      timestamps: true
    }
  );

  return Material;
};
