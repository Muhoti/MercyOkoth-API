const { Sequelize } = require('sequelize');

const connectionString = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
console.log('Connection string:', connectionString);

const sequelize = new Sequelize(connectionString);

module.exports = sequelize;