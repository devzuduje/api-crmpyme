'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.belongsTo(models.Rol, { foreignKey: 'rolId' });
    }
  }
  Usuario.init({
    nombre: { type: DataTypes.STRING(150), allowNull: false },
    correo: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    rolId: { type: DataTypes.INTEGER, allowNull: false },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    intentosFallidos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    bloqueadoHasta: { type: DataTypes.DATE, allowNull: true },
  }, { 
    sequelize, 
    modelName: 'Usuario', 
    tableName: 'usuarios', 
    underscored: true 
  });
  return Usuario;
};