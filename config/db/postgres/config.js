/* eslint camelcase:0 */
require('dotenv').config({ silent: true });
/*
	Databse configs will placed here
	We can change db config by POSTGRES_DB_ENV
 */
module.exports = {
  DEV: {
    username: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    database: process.env.POSTGRES_DB_NAME,
    host: process.env.POSTGRES_DB_HOST,
    port: process.env.POSTGRES_DB_PORT,
    dialect: 'postgres',
    ssl: false,
    logging: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // <<<<<< YOU NEED THIS
      }
    },
    pool: {
      handleDisconnects: true,
      max: 4,
      min: 1,
      idle: 100000,
      acquire: 200000
    }
  },
  PROD: {
    username: process.env.POSTGRES_DB_USER,
    password: process.env.POSTGRES_DB_PASSWORD,
    database: process.env.POSTGRES_DB_NAME,
    host: process.env.POSTGRES_DB_HOST,
    port: process.env.POSTGRES_DB_PORT,
    dialect: 'postgres',
    ssl: true,
    logging: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // <<<<<< YOU NEED THIS
      }
    },
    pool: {
      max: 6,
      min: 0,
      acquire: 200000
    }
  }
};
