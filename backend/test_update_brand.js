const db = require("./db");
const brand = "Devaloka Artisans";
const productId = 9; // ganapathy_01

db.query("UPDATE products SET brand = ? WHERE id = ?", [brand, productId], (err, result) => {
  if (err) {
    console.error("UPDATE ERROR:", err);
  } else {
    console.log("Update successful. Affected rows:", result.affectedRows);
    db.query("SELECT id, name, brand FROM products WHERE id = ?", [productId], (err2, rows) => {
      console.log("Verified Row:", rows);
      process.exit(0);
    });
  }
});
