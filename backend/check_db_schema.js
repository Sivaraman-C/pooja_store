const db = require("./db");

db.query("DESCRIBE orders", (err, results) => {
  if (err) {
    console.error("Error describing orders:", err);
    process.exit(1);
  }
  console.log("Orders table schema:", results);

  db.query("DESCRIBE order_items", (err, results) => {
      if (err) {
        console.error("Error describing order_items:", err);
        process.exit(1);
      }
      console.log("Order_items table schema:", results);
      process.exit(0);
  });
});
