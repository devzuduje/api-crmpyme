'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: { 
        allowNull: false, 
        autoIncrement: true, 
        primaryKey: true, 
        type: Sequelize.INTEGER 
      },
      nombre: { 
        type: Sequelize.STRING(30), 
        allowNull: false, 
        unique: true 
      },
      descripcion: { 
        type: Sequelize.STRING(255) 
      },
      createdAt: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        field: 'created_at' 
      },
      updatedAt: { 
        allowNull: false, 
        type: Sequelize.DATE, 
        field: 'updated_at' },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  },
};