const bcrypt = require("bcryptjs");
const db = require("./db");

const name = "Devaloka Super Admin";
const email = "superadmin@devaloka.com";
const password = "SuperAdmin@123";

async function createSuperAdmin() {
  try {
    await new Promise((resolve, reject) => {
      db.query(
        "ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin', 'super_admin') NOT NULL DEFAULT 'user'",
        (error) => error ? reject(error) : resolve()
      );
    });

    const existingUser = await new Promise((resolve, reject) => {
      db.query(
        "SELECT id FROM users WHERE email = ?",
        [email],
        (error, results) => error ? reject(error) : resolve(results[0])
      );
    });

    if (existingUser) {
      console.log("Super admin already exists");
      console.log("Email:", email);
      console.log("Password:", password);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'super_admin')",
        [name, email, hashedPassword],
        (error) => error ? reject(error) : resolve()
      );
    });

    console.log("Super admin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Super admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    db.end();
  }
}

createSuperAdmin();
