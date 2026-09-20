const db = require("../db");

const sql = "ALTER TABLE products ADD COLUMN brand VARCHAR(100) AFTER category";

db.query(sql, (err, results) => {
  if (err) {
    if (err.code === 'ER_DUP_COLUMN') {
      console.log("Column brand already exists.");
    } else {
      console.error("Error adding brand column:", err);
    }
  } else {
    console.log("Column brand added successfully.");
  }
  process.exit(0);
});
