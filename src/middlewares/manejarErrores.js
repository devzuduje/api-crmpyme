const { fail } = require('../utils/apiResponse');

function rutaNoEncontrada(req, res) {
  return fail(res, 404, 'RUTA_NO_ENCONTRADA', `No existe la ruta ${req.method} ${req.originalUrl}`);
}

// Express reconoce un manejador de errores porque recibe 4 parámetros.
// Aunque "next" no se use, NO se puede quitar.
// eslint-disable-next-line no-unused-vars
function manejarErrores(err, req, res, next) {
  if (err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, 409, 'REGISTRO_DUPLICADO', 'Ya existe un registro con ese valor');
  }

  const status = err.status || 500;

  if (status === 500) {
    console.error(err);
    return fail(res, 500, 'ERROR_INTERNO', 'Error inesperado en el servidor');
  }

  return fail(res, status, err.code || 'PETICION_INVALIDA', err.message);
}

module.exports = { rutaNoEncontrada, manejarErrores };