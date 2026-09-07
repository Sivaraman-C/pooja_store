const db = require("./db");

db.query("SELECT * FROM orders", (err, results) => {
  if (err) {
    console.error("Error fetching orders:", err);
    process.exit(1);
  }
  console.log("Total orders in DB:", results.length);
  console.log("Orders:", results);
  process.exit(0);
});
