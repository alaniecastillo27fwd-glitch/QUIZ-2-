'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('detalle_orden_compra', {
      id_detalle: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ordenes_compra',
          key: 'id_orden'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      cantidad: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
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

    await queryInterface.addIndex('detalle_orden_compra', ['id_orden'], {
      name: 'idx_detalle_orden_compra_orden'
    });
    await queryInterface.addIndex('detalle_orden_compra', ['id_material'], {
      name: 'idx_detalle_orden_compra_material'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('detalle_orden_compra');
  }
};
