const { Rol } = require('../../../models');

async function listar() {
  return Rol.findAll({ attributes: ['id', 'nombre', 'descripcion'], order: [['id', 'ASC']] });
}

module.exports = { listar };