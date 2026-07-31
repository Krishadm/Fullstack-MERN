const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  refreshToken: { type: DataTypes.TEXT, defaultValue: null },
});

User.beforeSave(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

User.prototype.toSafeObject = function () {
  return { id: this.id, name: this.name, email: this.email, phone: this.phone };
};

module.exports = User;
