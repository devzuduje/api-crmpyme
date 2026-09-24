const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../../../models');

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 5;

async function login(correo, password) {
  const usuario = await Usuario.findOne({ where: { correo }, include: Rol });

  if (!usuario || !usuario.activo) {
    throw { status: 401, code: 'CREDENCIALES_INVALIDAS', message: 'Correo o contraseña incorrectos' };
  }

  if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
    const minutosRestantes = Math.ceil((usuario.bloqueadoHasta - new Date()) / 60000);
    throw {
      status: 423,
      code: 'CUENTA_BLOQUEADA',
      message: `Cuenta bloqueada. Intenta de nuevo en ${minutosRestantes} minuto(s).`,
    };
  }

  const passwordValido = await bcrypt.compare(password, usuario.passwordHash);

  if (!passwordValido) {
    const nuevosIntentos = usuario.intentosFallidos + 1;
    const bloqueado = nuevosIntentos >= MAX_INTENTOS;

    await usuario.update({
      intentosFallidos: bloqueado ? 0 : nuevosIntentos,
      bloqueadoHasta: bloqueado ? new Date(Date.now() + MINUTOS_BLOQUEO * 60000) : null,
    });

    throw { status: 401, code: 'CREDENCIALES_INVALIDAS', message: 'Correo o contraseña incorrectos' };
  }

  await usuario.update({ intentosFallidos: 0, bloqueadoHasta: null });

  const usuarioPublico = { id: usuario.id, nombre: usuario.nombre, rol: usuario.Rol.nombre };
  const token = jwt.sign(usuarioPublico, process.env.JWT_SECRET, { expiresIn: '8h' });

  return { token, usuario: usuarioPublico };
}

module.exports = { login };
