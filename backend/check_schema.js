const db = require("./db");
db.query("DESCRIBE products", (err, results) => {
  if (err) {
    console.error("SCHEMA ERROR:", err);
  } else {
    console.log("Products Schema:", results);
  }
  process.exit(0);
});
