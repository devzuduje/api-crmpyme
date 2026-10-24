const bcrypt = require('bcrypt');

jest.mock('../../models', () => ({
  Usuario: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Rol: {
    findByPk: jest.fn(),
  },
}));

const { Usuario, Rol } = require('../../models');
const usuariosService = require('../../src/modules/usuarios/usuarios.service');

const datosValidos = {
  nombre: 'Ana Vendedora',
  correo: 'ana@crm.local',
  password: 'Temporal1',
  rolId: 3,
};

function usuarioFalso(extra = {}) {
  return {
    id: 7,
    nombre: 'Ana Vendedora',
    correo: 'ana@crm.local',
    passwordHash: '$2b$10$hashfalso',
    activo: true,
    rolId: 3,
    Rol: { id: 3, nombre: 'vendedor' },
    createdAt: new Date(),
    update: jest.fn(),
    ...extra,
  };
}

describe('usuariosService.crear', () => {
  afterEach(() => jest.clearAllMocks());

  test('rechaza si falta algún dato obligatorio', async () => {
    await expect(
      usuariosService.crear({ nombre: 'Ana' })
    ).rejects.toMatchObject({ status: 400, code: 'DATOS_FALTANTES' });
  });

  test('rechaza una contraseña que no cumple la política', async () => {
    await expect(
      usuariosService.crear({ ...datosValidos, password: 'corta' })
    ).rejects.toMatchObject({ status: 422, code: 'PASSWORD_DEBIL' });
  });

  test('rechaza un correo que ya está registrado', async () => {
    Rol.findByPk.mockResolvedValue({ id: 3, nombre: 'vendedor' });
    Usuario.findOne.mockResolvedValue(usuarioFalso());

    await expect(
      usuariosService.crear(datosValidos)
    ).rejects.toMatchObject({ status: 409, code: 'CORREO_DUPLICADO' });

    expect(Usuario.create).not.toHaveBeenCalled();
  });

  test('guarda la contraseña como hash y nunca la devuelve', async () => {
    Rol.findByPk.mockResolvedValue({ id: 3, nombre: 'vendedor' });
    Usuario.findOne.mockResolvedValue(null);
    Usuario.create.mockResolvedValue({ id: 7 });
    Usuario.findByPk.mockResolvedValue(usuarioFalso());

    const resultado = await usuariosService.crear(datosValidos);

    const datosGuardados = Usuario.create.mock.calls[0][0];
    expect(datosGuardados.passwordHash).not.toBe('Temporal1');
    expect(await bcrypt.compare('Temporal1', datosGuardados.passwordHash)).toBe(true);

    expect(resultado).not.toHaveProperty('passwordHash');
    expect(resultado.rol).toEqual({ id: 3, nombre: 'vendedor' });
  });
});

describe('usuariosService.actualizar', () => {
  afterEach(() => jest.clearAllMocks());

  test('responde 404 si el usuario no existe', async () => {
    Usuario.findByPk.mockResolvedValue(null);

    await expect(
      usuariosService.actualizar(999, datosValidos, 1)
    ).rejects.toMatchObject({ status: 404, code: 'USUARIO_NO_ENCONTRADO' });
  });
});

describe('usuariosService.cambiarEstado', () => {
  afterEach(() => jest.clearAllMocks());

  test('no permite que el administrador se desactive a sí mismo', async () => {
    Usuario.findByPk.mockResolvedValue(usuarioFalso({ id: 1 }));

    await expect(
      usuariosService.cambiarEstado(1, false, 1)
    ).rejects.toMatchObject({ status: 409, code: 'AUTO_DESACTIVACION' });
  });

  test('desactiva a otro usuario sin borrarlo', async () => {
    const usuario = usuarioFalso();
    Usuario.findByPk.mockResolvedValue(usuario);

    await usuariosService.cambiarEstado(7, false, 1);

    expect(usuario.update).toHaveBeenCalledWith({ activo: false });
  });
});