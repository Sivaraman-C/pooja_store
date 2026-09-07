const db = require("./db");

db.query("SELECT COUNT(*) as count FROM products", (err, results) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Total products:", results[0].count);

  db.query("SELECT * FROM products LIMIT 5", (err, results) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("Sample products:", results);
    process.exit(0);
  });
});
