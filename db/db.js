const DbDriver = require('mysql');

let dbPool = DbDriver.createPool({
  connectionLimit: 20,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

dbPool.on('error', function(error) {
  console.warn(error);
});

module.exports = dbPool;
