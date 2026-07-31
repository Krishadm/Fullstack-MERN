const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.PG_URI, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('PostgreSQL connected');
  } catch (err) {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
