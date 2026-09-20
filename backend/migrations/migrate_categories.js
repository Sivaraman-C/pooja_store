const db = require("../db");

const migrations = [
  { old: 'Essentials', new: 'Pooja Essentials' },
  { old: 'Kits', new: 'Pooja Kits' }
];

const runMigration = async () => {
  for (const m of migrations) {
    await new Promise((resolve) => {
      db.query("UPDATE products SET category = ? WHERE category = ?", [m.new, m.old], (err, result) => {
        if (err) console.error(`Error migrating ${m.old}:`, err);
        else console.log(`Migrated ${m.old} to ${m.new}. Rows affected: ${result.affectedRows}`);
        resolve();
      });
    });
  }
  process.exit(0);
};

runMigration();
