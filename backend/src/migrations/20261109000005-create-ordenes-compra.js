'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ordenes_compra', {
      id_orden: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      numero_orden: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      id_proveedor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'proveedores',
          key: 'id_proveedor'
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
      fecha_orden: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      estado: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pendiente'
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

    await queryInterface.addIndex('ordenes_compra', ['id_proveedor'], {
      name: 'idx_ordenes_compra_proveedor'
    });
    await queryInterface.addIndex('ordenes_compra', ['id_usuario'], {
      name: 'idx_ordenes_compra_usuario'
    });
    await queryInterface.addIndex('ordenes_compra', ['numero_orden'], {
      unique: true,
      name: 'idx_ordenes_compra_numero'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ordenes_compra');
  }
};
