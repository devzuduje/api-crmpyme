'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      { 
        nombre: 'administrador', 
        descripcion: 'Administrador del sistema', 
        created_at: new Date(), 
        updated_at: new Date() 
      },
      { 
        nombre: 'gerente', 
        descripcion: 'Gerente de ventas', 
        created_at: new Date(), 
        updated_at: new Date() 
      },
      { 
        nombre: 'vendedor', 
        descripcion: 'Vendedor', 
        created_at: new Date(), 
        updated_at: new Date() 
      },
    ]);
    const [[admin]] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE nombre = 'administrador'");
    const hash = await bcrypt.hash('Admin123', 10);
    await queryInterface.bulkInsert('usuarios', [{
      nombre: 'Administrador Inicial', 
      correo: 'admin@crm.local', 
      password_hash: hash,
      rol_id: admin.id, 
      activo: true, 
      intentos_fallidos: 0, 
      created_at: new Date(), 
      updated_at: new Date(),
    }]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};