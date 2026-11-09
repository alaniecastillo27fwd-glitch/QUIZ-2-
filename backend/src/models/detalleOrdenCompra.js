'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DetalleOrdenCompra extends Model {
    static associate(models) {
      DetalleOrdenCompra.belongsTo(models.OrdenCompra, {
        foreignKey: 'id_orden',
        as: 'orden'
      });
      DetalleOrdenCompra.belongsTo(models.Material, {
        foreignKey: 'id_material',
        as: 'material'
      });
      DetalleOrdenCompra.hasMany(models.Movimiento, {
        foreignKey: 'id_detalle_orden',
        as: 'movimientos'
      });
    }
  }

  DetalleOrdenCompra.init(
    {
      id_detalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ordenes_compra',
          key: 'id_orden'
        }
      },
      id_material: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'materiales',
          key: 'id_material'
        }
      },
      cantidad: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: { args: [0.01], msg: 'La cantidad debe ser mayor que 0' }
        }
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: { args: [0], msg: 'El precio unitario no puede ser negativo' }
        }
      }
    },
    {
      sequelize,
      modelName: 'DetalleOrdenCompra',
      tableName: 'detalle_orden_compra',
      underscored: true,
      timestamps: true
    }
  );

  return DetalleOrdenCompra;
};

