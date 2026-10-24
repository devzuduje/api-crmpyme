process.env.JWT_SECRET = 'secreto-de-pruebas';

const jwt = require('jsonwebtoken');

jest.mock('../../models', () => ({
  Usuario: { findByPk: jest.fn() },
  Rol: {},
}));

const { Usuario } = require('../../models');
const verificarToken = require('../../src/middlewares/verificarToken');
const permitirRoles = require('../../src/middlewares/permitirRoles');

function capturarError(funcion) {
  try {
    funcion();
  } catch (error) {
    return error;
  }
  return null;
}

describe('permitirRoles', () => {
  test('bloquea con 403 a un rol que no está en la lista', () => {
    const middleware = permitirRoles('administrador');
    const req = { usuario: { id: 2, rol: 'vendedor' } };
    const next = jest.fn();

    const error = capturarError(() => middleware(req, {}, next));

    expect(error).toMatchObject({ status: 403, code: 'ACCESO_DENEGADO' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deja pasar al rol permitido', () => {
    const middleware = permitirRoles('administrador');
    const req = { usuario: { id: 1, rol: 'administrador' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('verificarToken', () => {
  afterEach(() => jest.clearAllMocks());

  test('responde 401 si no llega el encabezado Authorization', async () => {
    const req = { headers: {} };

    await expect(verificarToken(req, {}, jest.fn()))
      .rejects.toMatchObject({ status: 401, code: 'TOKEN_FALTANTE' });
  });

  test('responde 401 si el token fue firmado con otro secreto', async () => {
    const tokenFalso = jwt.sign({ id: 1 }, 'otro-secreto');
    const req = { headers: { authorization: `Bearer ${tokenFalso}` } };

    await expect(verificarToken(req, {}, jest.fn()))
      .rejects.toMatchObject({ status: 401, code: 'TOKEN_INVALIDO' });
  });

  test('responde 401 si el usuario del token fue desactivado', async () => {
    const token = jwt.sign({ id: 3 }, process.env.JWT_SECRET);
    Usuario.findByPk.mockResolvedValue({ id: 3, activo: false, Rol: { nombre: 'administrador' } });
    const req = { headers: { authorization: `Bearer ${token}` } };

    await expect(verificarToken(req, {}, jest.fn()))
      .rejects.toMatchObject({ status: 401, code: 'SESION_INVALIDA' });
  });

  test('con un token válido guarda el usuario en req y llama a next', async () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
    Usuario.findByPk.mockResolvedValue({ id: 1, nombre: 'Admin', activo: true, Rol: { nombre: 'administrador' } });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    await verificarToken(req, {}, next);

    expect(req.usuario).toEqual({ id: 1, nombre: 'Admin', rol: 'administrador' });
    expect(next).toHaveBeenCalled();
  });
});
