const express = require("express");
const db = require("../db");

const router = express.Router();

/* =========================
   GET ALL CATEGORIES
========================= */

router.get("/", (req, res) => {

    const sql = `
        SELECT *
        FROM categories
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "GET CATEGORIES ERROR:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch categories",
                error: err.message
            });
        }

        res.json(results);

    });

});


/* =========================
   ADD CATEGORY
========================= */

router.post("/", (req, res) => {

    const {
        name,
        description
    } = req.body;

    if (!name) {

        return res.status(400).json({
            message: "Category name is required"
        });

    }

    const sql = `
        INSERT INTO categories
        (
            name,
            description
        )
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [
            name,
            description || ""
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "ADD CATEGORY ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to add category",
                    error: err.message
                });

            }

            res.status(201).json({
                message: "Category added successfully",
                categoryId: result.insertId
            });

        }
    );

});


/* =========================
   DELETE CATEGORY
========================= */

router.delete("/:id", (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM categories
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE CATEGORY ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to delete category",
                    error: err.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Category not found"
                });

            }

            res.json({
                message: "Category deleted successfully"
            });

        }
    );

});


module.exports = router;