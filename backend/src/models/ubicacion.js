'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ubicacion extends Model {
    static associate(models) {
      Ubicacion.hasMany(models.Movimiento, {
        foreignKey: 'id_ubicacion_origen',
        as: 'movimientosOrigen'
      });
      Ubicacion.hasMany(models.Movimiento, {
        foreignKey: 'id_ubicacion_destino',
        as: 'movimientosDestino'
      });
    }
  }

  Ubicacion.init(
    {
      id_ubicacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre de la ubicación es obligatorio' }
        }
      },
      tipo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'bodega',
        validate: {
          isIn: {
            args: [['bodega', 'obra', 'mantenimiento', 'externo']],
            msg: 'Tipo de ubicación inválido'
          }
        }
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Ubicacion',
      tableName: 'ubicaciones',
      underscored: true,
      timestamps: true
    }
  );

  return Ubicacion;
};

