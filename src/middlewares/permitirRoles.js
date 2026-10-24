function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw { status: 403, code: 'ACCESO_DENEGADO', message: 'No tienes permiso para acceder a este módulo' };
    }
    next();
  };
}

module.exports = permitirRoles;