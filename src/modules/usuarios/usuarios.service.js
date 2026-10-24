const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { Usuario, Rol } = require('../../../models');

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POLITICA_PASSWORD = /^(?=.*\d).{8,}$/;

// ---------- funciones de apoyo (no se exportan) ----------
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function aUsuarioPublico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    activo: usuario.activo,
    rol: { id: usuario.Rol.id, nombre: usuario.Rol.nombre },
    creadoEn: usuario.createdAt,
  };
}

async function buscarUsuario(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw { status: 400, code: 'ID_INVALIDO', message: 'El id del usuario debe ser un número entero positivo' };
  }

  const usuario = await Usuario.findByPk(numero, { include: Rol });
  if (!usuario) {
    throw { status: 404, code: 'USUARIO_NO_ENCONTRADO', message: 'No existe un usuario con ese id' };
  }
  return usuario;
}

function validarFormatoCorreo(correo) {
  if (!FORMATO_CORREO.test(correo)) {
    throw { status: 422, code: 'CORREO_INVALIDO', message: 'El correo no tiene un formato válido' };
  }
}

async function validarRol(rolId) {
  const rol = Number.isInteger(Number(rolId)) ? await Rol.findByPk(Number(rolId)) : null;
  if (!rol) {
    throw { status: 422, code: 'ROL_INVALIDO', message: 'El rol seleccionado no existe' };
  }
}

async function validarCorreoDisponible(correo, idQueSeEdita = null) {
  const condicion = { correo };
  if (idQueSeEdita) {
    condicion.id = { [Op.ne]: idQueSeEdita };
  }

  const existente = await Usuario.findOne({ where: condicion });
  if (existente) {
    throw { status: 409, code: 'CORREO_DUPLICADO', message: 'Ya existe un usuario registrado con ese correo' };
  }
}

// ---------- funciones públicas (las usa el controlador) ----------
async function listar() {
  const usuarios = await Usuario.findAll({ include: Rol, order: [['nombre', 'ASC']] });
  return usuarios.map(aUsuarioPublico);
}

async function obtenerPorId(id) {
  const usuario = await buscarUsuario(id);
  return aUsuarioPublico(usuario);
}

async function crear(datos) {
  const nombre = texto(datos.nombre);
  const correo = texto(datos.correo).toLowerCase();
  const { password, rolId } = datos;

  if (!nombre || !correo || !password || !rolId) {
    throw { status: 400, code: 'DATOS_FALTANTES', message: 'Nombre, correo, contraseña temporal y rol son obligatorios' };
  }

  validarFormatoCorreo(correo);

  if (typeof password !== 'string' || !POLITICA_PASSWORD.test(password)) {
    throw { status: 422, code: 'PASSWORD_DEBIL', message: 'La contraseña debe tener al menos 8 caracteres y 1 número' };
  }

  await validarRol(rolId);
  await validarCorreoDisponible(correo);

  const passwordHash = await bcrypt.hash(password, 10);
  const nuevo = await Usuario.create({ nombre, correo, passwordHash, rolId: Number(rolId) });

  return obtenerPorId(nuevo.id);
}

async function actualizar(id, datos, idDelAdmin) {
  const usuario = await buscarUsuario(id);

  const nombre = texto(datos.nombre);
  const correo = texto(datos.correo).toLowerCase();
  const { rolId } = datos;

  if (!nombre || !correo || !rolId) {
    throw { status: 400, code: 'DATOS_FALTANTES', message: 'Nombre, correo y rol son obligatorios' };
  }

  validarFormatoCorreo(correo);
  await validarRol(rolId);

  if (usuario.id === idDelAdmin && Number(rolId) !== usuario.rolId) {
    throw { status: 409, code: 'AUTO_CAMBIO_ROL', message: 'No puedes cambiar tu propio rol' };
  }

  await validarCorreoDisponible(correo, usuario.id);

  await usuario.update({ nombre, correo, rolId: Number(rolId) });
  return obtenerPorId(usuario.id);
}

async function cambiarEstado(id, activo, idDelAdmin) {
  if (typeof activo !== 'boolean') {
    throw { status: 400, code: 'ESTADO_INVALIDO', message: 'El campo activo debe ser true o false' };
  }

  const usuario = await buscarUsuario(id);

  if (usuario.id === idDelAdmin && activo === false) {
    throw { status: 409, code: 'AUTO_DESACTIVACION', message: 'No puedes desactivar tu propia cuenta' };
  }

  await usuario.update({ activo });
  return aUsuarioPublico(usuario);
}

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarEstado };