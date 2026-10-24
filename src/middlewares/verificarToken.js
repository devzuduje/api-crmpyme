const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../../models');

async function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    throw { status: 401, code: 'TOKEN_FALTANTE', message: 'Debes iniciar sesión para acceder a este recurso' };
  }

  const token = encabezado.slice(7);

  let datosDelToken;
  try {
    datosDelToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw { status: 401, code: 'TOKEN_INVALIDO', message: 'La sesión no es válida o ya expiró. Inicia sesión de nuevo' };
  }

  const usuario = await Usuario.findByPk(datosDelToken.id, { include: Rol });

  if (!usuario || !usuario.activo) {
    throw { status: 401, code: 'SESION_INVALIDA', message: 'Tu usuario ya no tiene acceso al sistema' };
  }

  req.usuario = { id: usuario.id, nombre: usuario.nombre, rol: usuario.Rol.nombre };
  next();
}

module.exports = verificarToken;