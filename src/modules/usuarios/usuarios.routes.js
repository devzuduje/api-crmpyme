const { Router } = require('express');
const verificarToken = require('../../middlewares/verificarToken');
const permitirRoles = require('../../middlewares/permitirRoles');
const usuariosController = require('./usuarios.controller');

const router = Router();

// Todo el módulo de usuarios es exclusivo del Administrador (HU-02).
router.use(verificarToken, permitirRoles('administrador'));

router.get('/', usuariosController.listar);
router.get('/:id', usuariosController.obtener);
router.post('/', usuariosController.crear);
router.put('/:id', usuariosController.actualizar);
router.patch('/:id/estado', usuariosController.cambiarEstado);

module.exports = router;