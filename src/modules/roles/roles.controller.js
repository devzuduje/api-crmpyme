const rolesService = require('./roles.service');
const { ok } = require('../../utils/apiResponse');

async function listar(req, res) {
  const roles = await rolesService.listar();
  return ok(res, roles);
}

module.exports = { listar };