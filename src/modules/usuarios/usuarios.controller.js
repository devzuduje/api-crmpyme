const usuariosService = require('./usuarios.service');
const { ok } = require('../../utils/apiResponse');

async function listar(req, res) {
  const usuarios = await usuariosService.listar();
  return ok(res, usuarios);
}

async function obtener(req, res) {
  const usuario = await usuariosService.obtenerPorId(req.params.id);
  return ok(res, usuario);
}

async function crear(req, res) {
  const usuario = await usuariosService.crear(req.body ?? {});
  return ok(res, usuario, 201);
}

async function actualizar(req, res) {
  const usuario = await usuariosService.actualizar(req.params.id, req.body ?? {}, req.usuario.id);
  return ok(res, usuario);
}

async function cambiarEstado(req, res) {
  const { activo } = req.body ?? {};
  const usuario = await usuariosService.cambiarEstado(req.params.id, activo, req.usuario.id);
  return ok(res, usuario);
}

module.exports = { listar, obtener, crear, actualizar, cambiarEstado };