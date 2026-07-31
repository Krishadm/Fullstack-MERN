const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Inquiry = sequelize.define(
  'Inquiry',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    propertyId: { type: DataTypes.INTEGER, allowNull: false },
    fromUserId: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.STRING(1000), allowNull: false },
  },
  {
    indexes: [{ unique: true, fields: ['propertyId', 'fromUserId'] }],
  }
);

module.exports = Inquiry;
