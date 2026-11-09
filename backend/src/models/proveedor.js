'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Proveedor extends Model {
    static associate(models) {
      Proveedor.hasMany(models.OrdenCompra, {
        foreignKey: 'id_proveedor',
        as: 'ordenesCompra'
      });
    }
  }

  Proveedor.init(
    {
      id_proveedor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre del proveedor es obligatorio' }
        }
      },
      telefono: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      correo: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
          isEmail: { msg: 'El correo del proveedor no es válido' }
        }
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Proveedor',
      tableName: 'proveedores',
      underscored: true,
      timestamps: true
    }
  );

  return Proveedor;
};

