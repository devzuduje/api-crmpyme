const { Router } = require('express');
const verificarToken = require('../../middlewares/verificarToken');
const permitirRoles = require('../../middlewares/permitirRoles');
const rolesController = require('./roles.controller');

const router = Router();
router.use(verificarToken, permitirRoles('administrador'));
router.get('/', rolesController.listar);

module.exports = router;