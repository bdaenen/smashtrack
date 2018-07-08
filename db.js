const DbDriver = require('mysql');

let dbPool = DbDriver.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'smashtracker',
  password: 'munK84xMJp6pe693kTJcbKqB',
  database: 'smashtracker'
});

module.exports = dbPool;
