const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: process.env.PGDIALECT,
    logging: false,
    dialectOptions: {
        ssl: false // set to true if your database requires SSL
    }
});

module.exports = sequelize;