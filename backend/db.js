
const mysql = require("mysql2");
const path = require("path");

// Load .env from the backend directory
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Admin1234#@",
  database: process.env.DB_NAME || "devaloka",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : null
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully");
  connection.release();
});

module.exports = db;