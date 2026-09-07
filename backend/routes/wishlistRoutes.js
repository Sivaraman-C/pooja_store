const express = require("express");
const db = require("../db");

const router = express.Router();

// Get wishlist for a user
router.get("/:userId", (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT w.id as wishlist_id, p.*
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("GET WISHLIST ERROR:", err);
            return res.status(500).json({ message: "Failed to fetch wishlist" });
        }
        res.json(results);
    });
});

// Toggle wishlist (Add if not exists, remove if exists)
router.post("/toggle", (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({ message: "userId and productId are required" });
    }

    const checkSql = "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?";
    db.query(checkSql, [userId, productId], (err, results) => {
        if (err) {
            console.error("CHECK WISHLIST ERROR:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length > 0) {
            // Already in wishlist, remove it
            const deleteSql = "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?";
            db.query(deleteSql, [userId, productId], (deleteErr) => {
                if (deleteErr) {
                    console.error("DELETE WISHLIST ERROR:", deleteErr);
                    return res.status(500).json({ message: "Failed to remove from wishlist" });
                }
                res.json({ message: "Removed from wishlist", liked: false });
            });
        } else {
            // Not in wishlist, add it
            const insertSql = "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)";
            db.query(insertSql, [userId, productId], (insertErr) => {
                if (insertErr) {
                    console.error("INSERT WISHLIST ERROR:", insertErr);
                    return res.status(500).json({ message: "Failed to add to wishlist" });
                }
                res.json({ message: "Added to wishlist", liked: true });
            });
        }
    });
});

module.exports = router;
