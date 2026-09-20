const db = require("../db");

db.query("UPDATE products SET brand = 'Sacred Heritage' WHERE brand IS NULL", (err, result) => {
  if (err) {
    console.error("Migration error:", err);
  } else {
    console.log("Updated products with null brand. Rows affected:", result.affectedRows);
  }
  process.exit(0);
});
