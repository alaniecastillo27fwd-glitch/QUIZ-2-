'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.hasMany(models.OrdenCompra, {
        foreignKey: 'id_usuario',
        as: 'ordenesCompra'
      });
      Usuario.hasMany(models.Movimiento, {
        foreignKey: 'id_usuario',
        as: 'movimientos'
      });
    }

    async verificarPassword(plano) {
      if (!this.password) return false;
      return bcrypt.compare(plano, this.password);
    }

    toJSON() {
      const datos = { ...this.get() };
      delete datos.password;
      return datos;
    }
  }

  Usuario.init(
    {
      id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre es obligatorio' },
          len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' }
        }
      },
      correo: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: { msg: 'Ese correo ya está registrado' },
        validate: {
          isEmail: { msg: 'El correo no tiene un formato válido' }
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      rol: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'bodega',
        validate: {
          notEmpty: { msg: 'El rol es obligatorio' }
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
      modelName: 'Usuario',
      tableName: 'usuarios',
      underscored: true,
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['password'] }
      },
      scopes: {
        conPassword: { attributes: {} }
      },
      hooks: {
        beforeSave: async (usuario) => {
          if (usuario.changed('password') && usuario.password) {
            usuario.password = await bcrypt.hash(usuario.password, SALT_ROUNDS);
          }
        }
      }
    }
  );

  return Usuario;
};

