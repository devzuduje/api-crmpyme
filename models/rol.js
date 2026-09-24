'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    static associate(models) {
      Rol.hasMany(models.Usuario, { foreignKey: 'rolId' });
    }
  }
  Rol.init({
    nombre: { 
      type: DataTypes.STRING(30), 
      allowNull: false, 
      unique: true 
    },
    descripcion: DataTypes.STRING(255),
  }, { sequelize, modelName: 'Rol', tableName: 'roles', underscored: true });
  return Rol;
};