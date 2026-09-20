const db = require("./db");
db.query("SELECT id, name, category, brand FROM products LIMIT 10", (err, results) => {
  if (err) {
    console.error("DEBUG ERROR:", err);
  } else {
    console.log("Current Products with Brand:", results);
  }
  process.exit(0);
});
