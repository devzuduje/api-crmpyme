process.env.JWT_SECRET = 'secreto-de-pruebas';

const bcrypt = require('bcrypt');
const { Usuario } = require('../../models');
const authService = require('../../src/modules/auth/auth.service');

jest.mock('../../models', () => ({
  Usuario: {
    findOne: jest.fn(),
  },
  Rol: {},
}));

describe('authService.login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('rechaza si el usuario no existe', async () => {
    Usuario.findOne.mockResolvedValue(null);

    await expect(
      authService.login('no-existe@crm.local', 'cualquiera')
    ).rejects.toMatchObject({ code: 'CREDENCIALES_INVALIDAS' });
  });

  test('rechaza si la contraseña no coincide', async () => {
    const usuarioFalso = {
      id: 1,
      nombre: 'Admin',
      activo: true,
      Rol: { nombre: 'admin' },
      passwordHash: await bcrypt.hash('claveCorrecta', 10),
      intentosFallidos: 0,
      bloqueadoHasta: null,
      update: jest.fn(),
    };
    Usuario.findOne.mockResolvedValue(usuarioFalso);

    await expect(
      authService.login('admin@crm.local', 'claveIncorrecta')
    ).rejects.toMatchObject({ code: 'CREDENCIALES_INVALIDAS' });
  });

  test('devuelve token y usuario si las credenciales son correctas', async () => {
    const usuarioFalso = {
      id: 1,
      nombre: 'Admin',
      activo: true,
      Rol: { nombre: 'admin' },
      passwordHash: await bcrypt.hash('claveCorrecta', 10),
      intentosFallidos: 0,
      bloqueadoHasta: null,
      update: jest.fn(),
    };
    Usuario.findOne.mockResolvedValue(usuarioFalso);

    const resultado = await authService.login('admin@crm.local', 'claveCorrecta');

    expect(resultado).toHaveProperty('token');
    expect(resultado.usuario).toEqual({ id: 1, nombre: 'Admin', rol: 'admin' });
  });
});