const authService = require('./auth.service');
const { ok } = require('../../utils/apiResponse');

async function login(req, res) {
  const { correo, password } = req.body ?? {};

  if (!correo || !password) {
    throw { status: 400, code: 'DATOS_FALTANTES', message: 'Correo y contraseña son obligatorios' };
  }

  const resultado = await authService.login(String(correo).trim().toLowerCase(), password);
  return ok(res, resultado);
}

module.exports = { login };