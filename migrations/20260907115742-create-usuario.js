'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: { 
        allowNull: false, 
        autoIncrement: true, 
        primaryKey: true, 
        type: Sequelize.INTEGER 
      },
      nombre: { 
        type: Sequelize.STRING(150), 
        allowNull: false 
      },
      correo: { 
        type: Sequelize.STRING(150), 
        allowNull: false, 
        unique: true 
      },
      passwordHash: { 
        type: Sequelize.STRING(255), 
        allowNull: false, 
        field: 'password_hash' 
      },
      rolId: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        field: 'rol_id',
        references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      activo: { 
        type: Sequelize.BOOLEAN, 
        allowNull: false, 
        defaultValue: true 
      },
      intentosFallidos: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        defaultValue: 0, 
        field: 'intentos_fallidos' 
      },
      bloqueadoHasta: { 
        type: Sequelize.DATE, 
        allowNull: true, 
        field: 'bloqueado_hasta' 
      },
      createdAt: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        field: 'created_at' 
      },
      updatedAt: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        field: 'updated_at' 
      },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('usuarios'); },
};