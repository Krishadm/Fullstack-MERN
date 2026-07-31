const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ContactMessage = sequelize.define('ContactMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  message: { type: DataTypes.STRING(2000), allowNull: false },
});

module.exports = ContactMessage;
