const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Property = sequelize.define('Property', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  type: {
    type: DataTypes.ENUM('apartment', 'house', 'villa', 'commercial', 'plot', 'pg'),
    allowNull: false,
  },
  status: { type: DataTypes.ENUM('for_sale', 'for_rent'), allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  locality: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  bedrooms: { type: DataTypes.INTEGER, defaultValue: 0 },
  bathrooms: { type: DataTypes.INTEGER, defaultValue: 0 },
  area: { type: DataTypes.FLOAT, allowNull: false },
  images: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  amenities: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  isFurnished: { type: DataTypes.BOOLEAN, defaultValue: false },
  parkingAvailable: { type: DataTypes.BOOLEAN, defaultValue: false },
  ownerId: { type: DataTypes.INTEGER, allowNull: false },
  inquiryCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  deletedAt: { type: DataTypes.DATE, defaultValue: null },
});

module.exports = Property;
