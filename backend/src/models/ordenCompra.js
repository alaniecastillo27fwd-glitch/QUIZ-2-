'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrdenCompra extends Model {
    static associate(models) {
      OrdenCompra.belongsTo(models.Proveedor, {
        foreignKey: 'id_proveedor',
        as: 'proveedor'
      });
      OrdenCompra.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
      });
      OrdenCompra.hasMany(models.DetalleOrdenCompra, {
        foreignKey: 'id_orden',
        as: 'detalles'
      });
    }
  }

  OrdenCompra.init(
    {
      id_orden: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      numero_orden: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: { msg: 'El número de orden ya existe' }
      },
      id_proveedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'proveedores',
          key: 'id_proveedor'
        }
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id_usuario'
        }
      },
      fecha_orden: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pendiente',
        validate: {
          isIn: {
            args: [['pendiente', 'aprobada', 'recibida', 'cancelada']],
            msg: 'Estado de orden inválido'
          }
        }
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'OrdenCompra',
      tableName: 'ordenes_compra',
      underscored: true,
      timestamps: true
    }
  );

  return OrdenCompra;
};
