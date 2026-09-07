const express = require("express");
const db = require("../db");

const router = express.Router();


/* =========================
   GET ALL CUSTOMERS
========================= */

router.get("/", (req, res) => {

    if (!["admin", "super_admin"].includes(req.headers["x-user-role"])) {
        return res.status(403).json({ message: "You do not have permission" });
    }

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            address,
            city,
            state,
            pincode,
            role,
            created_at
        FROM users
        WHERE role = 'user'
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "GET CUSTOMERS ERROR:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch customers",
                error: err.message
            });

        }

        res.json(results);

    });

});

router.put("/:id", (req, res) => {
    if (!["admin", "super_admin"].includes(req.headers["x-user-role"])) {
        return res.status(403).json({ message: "You do not have permission" });
    }

    const { name, email, phone, address, city, state, pincode } = req.body || {};
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    db.query(
        "UPDATE users SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ? AND role = 'user'",
        [name, email, phone || null, address || null, city || null, state || null, pincode || null, req.params.id],
        (err, result) => {
            if (err) {
                console.error("UPDATE CUSTOMER ERROR:", err);
                return res.status(500).json({ message: "Failed to update customer" });
            }
            if (!result.affectedRows) return res.status(404).json({ message: "Customer not found" });
            res.json({ message: "Customer updated successfully" });
        }
    );
});

router.delete("/:id", (req, res) => {
    if (!["admin", "super_admin"].includes(req.headers["x-user-role"])) {
        return res.status(403).json({ message: "You do not have permission" });
    }

    db.query("DELETE FROM users WHERE id = ? AND role = 'user'", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to delete customer" });
        if (!result.affectedRows) return res.status(404).json({ message: "Customer not found" });
        res.json({ message: "Customer deleted successfully" });
    });
});


module.exports = router;