const db = require("../db");

db.query(
  "ALTER TABLE products ADD COLUMN images JSON NULL AFTER image",
  (error) => {
    if (error && !["ER_DUP_FIELDNAME", "ER_DUP_COLUMN"].includes(error.code)) {
      console.error("Unable to add product images column:", error);
      process.exitCode = 1;
    } else if (error) {
      console.log("Product images column already exists.");
    } else {
      console.log("Product images column added successfully.");
    }

    db.end(() => process.exit(process.exitCode || 0));
  }
);
