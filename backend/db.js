
const mysql = require("mysql2");
const path = require("path");

// Load .env only if it exists (for local development)
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Admin1234#@",
  database: process.env.DB_NAME || "devaloka",
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Add SSL for cloud databases (like Aiven)
if (process.env.DB_SSL === "true" || dbConfig.host.includes("aivencloud.com")) {
  dbConfig.ssl = { rejectUnauthorized: false };
}

console.log(`Connecting to database at ${dbConfig.host}:${dbConfig.port}...`);

const db = mysql.createPool(dbConfig);

db.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL connection failed! Error:", err.message);
    console.error("Current Config Host:", dbConfig.host);
    return;
  }

  console.log("MySQL connected successfully to", dbConfig.host);
  connection.release();
});

module.exports = db;