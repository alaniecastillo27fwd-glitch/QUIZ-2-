'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('movimientos', {
      id_movimiento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_material: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'materiales',
          key: 'id_material'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id_usuario'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo_movimiento: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      cantidad: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      fecha_movimiento: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      id_ubicacion_origen: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ubicaciones',
          key: 'id_ubicacion'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_ubicacion_destino: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ubicaciones',
          key: 'id_ubicacion'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_detalle_orden: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'detalle_orden_compra',
          key: 'id_detalle'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      documento_referencia: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('movimientos', ['id_material'], {
      name: 'idx_movimientos_material'
    });
    await queryInterface.addIndex('movimientos', ['id_usuario'], {
      name: 'idx_movimientos_usuario'
    });
    await queryInterface.addIndex('movimientos', ['fecha_movimiento'], {
      name: 'idx_movimientos_fecha'
    });
    await queryInterface.addIndex('movimientos', ['id_ubicacion_origen'], {
      name: 'idx_movimientos_ubicacion_origen'
    });
    await queryInterface.addIndex('movimientos', ['id_ubicacion_destino'], {
      name: 'idx_movimientos_ubicacion_destino'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('movimientos');
  }
};
