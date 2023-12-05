const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "acesso123",
  database: "saeb",
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
});

module.exports = pool.promise();
