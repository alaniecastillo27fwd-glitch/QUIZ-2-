'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Movimiento extends Model {
    static associate(models) {
      Movimiento.belongsTo(models.Material, {
        foreignKey: 'id_material',
        as: 'material'
      });
      Movimiento.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
      });
      Movimiento.belongsTo(models.Ubicacion, {
        foreignKey: 'id_ubicacion_origen',
        as: 'ubicacionOrigen'
      });
      Movimiento.belongsTo(models.Ubicacion, {
        foreignKey: 'id_ubicacion_destino',
        as: 'ubicacionDestino'
      });
      Movimiento.belongsTo(models.DetalleOrdenCompra, {
        foreignKey: 'id_detalle_orden',
        as: 'detalleOrden'
      });
    }
  }

  Movimiento.init(
    {
      id_movimiento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_material: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'materiales',
          key: 'id_material'
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
      tipo_movimiento: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: {
            args: [['entrada', 'salida', 'traslado', 'ajuste']],
            msg: 'Tipo de movimiento inválido (debe ser: entrada, salida, traslado o ajuste)'
          }
        }
      },
      cantidad: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: { args: [0.01], msg: 'La cantidad debe ser mayor a 0' }
        }
      },
      fecha_movimiento: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      id_ubicacion_origen: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'ubicaciones',
          key: 'id_ubicacion'
        }
      },
      id_ubicacion_destino: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'ubicaciones',
          key: 'id_ubicacion'
        }
      },
      id_detalle_orden: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'detalle_orden_compra',
          key: 'id_detalle'
        }
      },
      documento_referencia: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El documento de referencia es obligatorio (ej. OC-1041 o Vale de Salida)' }
        }
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Movimiento',
      tableName: 'movimientos',
      underscored: true,
      timestamps: true
    }
  );

  return Movimiento;
};

