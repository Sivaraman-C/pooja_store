const bcrypt = require("bcryptjs");
const db = require("./db");

const name = "Devaloka Admin";
const email = "admin@devaloka.com";
const password = "Admin@123";

async function createAdmin() {

  try {

    const hashedPassword =
      await bcrypt.hash(password, 10);


    const sql = `
      INSERT INTO users
      (
        name,
        email,
        password,
        role
      )
      VALUES (?, ?, ?, 'admin')
    `;


    db.query(
      sql,
      [
        name,
        email,
        hashedPassword,
      ],
      (err, result) => {

        if (err) {

          console.error(
            "Admin creation failed:",
            err
          );

          process.exit(1);

        }


        console.log(
          "Admin created successfully"
        );

        console.log(
          "Email:",
          email
        );

        console.log(
          "Password:",
          password
        );

        process.exit(0);

      }
    );

  } catch (error) {

    console.error(error);

    process.exit(1);

  }

}

createAdmin();