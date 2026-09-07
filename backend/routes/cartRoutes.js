const express = require("express");
const db = require("../db");

const router = express.Router();

/*
=====================================================
GET CART
GET /api/cart?user_id=1
=====================================================
*/

router.get("/", (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({
            message: "user_id is required",
        });
    }

    const sql = `
        SELECT
            c.id AS cart_id,
            c.user_id,
            c.product_id,
            c.quantity,

            p.name,
            p.price,
            p.image,
            p.category,
            p.stock

        FROM cart_items c

        INNER JOIN products p
            ON c.product_id = p.id

        WHERE c.user_id = ?

        ORDER BY c.created_at DESC
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("GET CART ERROR:", err);

            return res.status(500).json({
                message: "Failed to fetch cart",
                error: err.message,
            });
        }

        res.json({
            cart: results,
        });
    });
});


/*
=====================================================
GET CART COUNT
GET /api/cart/count?user_id=1
=====================================================
*/

router.get("/count", (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({
            message: "user_id is required",
        });
    }

    const sql = `
        SELECT COALESCE(SUM(quantity), 0) AS count
        FROM cart_items
        WHERE user_id = ?
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("CART COUNT ERROR:", err);

            return res.status(500).json({
                message: "Failed to fetch cart count",
            });
        }

        res.json({
            count: Number(results[0].count || 0),
        });
    });
});


/*
=====================================================
ADD TO CART
POST /api/cart
=====================================================
*/

router.post("/", (req, res) => {
    const {
        user_id,
        product_id,
        quantity = 1,
    } = req.body;

    if (!user_id || !product_id) {
        return res.status(400).json({
            message:
                "user_id and product_id are required",
        });
    }

    const requestedQuantity = Number(quantity);

    if (
        !Number.isInteger(requestedQuantity) ||
        requestedQuantity < 1
    ) {
        return res.status(400).json({
            message: "Quantity must be at least 1",
        });
    }

    /*
    =================================================
    GET PRODUCT
    =================================================
    */

    const productSql = `
        SELECT
            id,
            name,
            price,
            image,
            category,
            stock
        FROM products
        WHERE id = ?
    `;

    db.query(
        productSql,
        [product_id],
        (err, products) => {
            if (err) {
                console.error(
                    "CHECK PRODUCT ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Database error",
                });
            }

            if (products.length === 0) {
                return res.status(404).json({
                    message: "Product not found",
                });
            }

            const product = products[0];

            /*
            =============================================
            CHECK STOCK
            =============================================
            */

            if (
                product.stock !== null &&
                Number(product.stock) < requestedQuantity
            ) {
                return res.status(400).json({
                    message:
                        `Only ${product.stock} item(s) available`,
                });
            }

            /*
            =============================================
            CHECK EXISTING CART
            =============================================
            */

            const checkSql = `
                SELECT id, quantity
                FROM cart_items
                WHERE user_id = ?
                AND product_id = ?
            `;

            db.query(
                checkSql,
                [
                    user_id,
                    product_id,
                ],
                (err, existing) => {
                    if (err) {
                        console.error(
                            "CHECK CART ERROR:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to check cart",
                        });
                    }

                    /*
                    =====================================
                    EXISTING PRODUCT
                    =====================================
                    */

                    if (existing.length > 0) {
                        const newQuantity =
                            Number(existing[0].quantity) +
                            requestedQuantity;

                        if (
                            product.stock !== null &&
                            newQuantity > Number(product.stock)
                        ) {
                            return res.status(400).json({
                                message:
                                    `Only ${product.stock} item(s) available`,
                            });
                        }

                        const updateSql = `
                            UPDATE cart_items
                            SET quantity = ?
                            WHERE id = ?
                        `;

                        db.query(
                            updateSql,
                            [
                                newQuantity,
                                existing[0].id,
                            ],
                            (err) => {
                                if (err) {
                                    console.error(
                                        "UPDATE CART ERROR:",
                                        err
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to update cart",
                                    });
                                }

                                res.json({
                                    message:
                                        "Product quantity updated",

                                    cart: {
                                        id:
                                            existing[0].id,

                                        user_id:
                                            Number(user_id),

                                        product_id:
                                            Number(product_id),

                                        quantity:
                                            newQuantity,
                                    },

                                    product,
                                });
                            }
                        );

                        return;
                    }

                    /*
                    =====================================
                    NEW CART ITEM
                    =====================================
                    */

                    const insertSql = `
                        INSERT INTO cart_items
                        (
                            user_id,
                            product_id,
                            quantity
                        )
                        VALUES (?, ?, ?)
                    `;

                    db.query(
                        insertSql,
                        [
                            user_id,
                            product_id,
                            requestedQuantity,
                        ],
                        (err, result) => {
                            if (err) {
                                console.error(
                                    "ADD CART ERROR:",
                                    err
                                );

                                return res.status(500).json({
                                    message:
                                        "Failed to add product to cart",
                                    error:
                                        err.message,
                                });
                            }

                            res.status(201).json({
                                message:
                                    "Product added to cart",

                                cart: {
                                    id:
                                        result.insertId,

                                    user_id:
                                        Number(user_id),

                                    product_id:
                                        Number(product_id),

                                    quantity:
                                        requestedQuantity,
                                },

                                product,
                            });
                        }
                    );
                }
            );
        }
    );
});


/*
=====================================================
UPDATE QUANTITY
PUT /api/cart/:productId
=====================================================
*/

router.put("/:productId", (req, res) => {
    const { productId } = req.params;

    const {
        user_id,
        quantity,
    } = req.body;

    if (!user_id) {
        return res.status(400).json({
            message: "user_id is required",
        });
    }

    const newQuantity = Number(quantity);

    if (
        !Number.isInteger(newQuantity) ||
        newQuantity < 1
    ) {
        return res.status(400).json({
            message:
                "Quantity must be at least 1",
        });
    }

    /*
    Check product stock
    */

    const stockSql = `
        SELECT stock
        FROM products
        WHERE id = ?
    `;

    db.query(
        stockSql,
        [productId],
        (err, products) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error",
                });
            }

            if (products.length === 0) {
                return res.status(404).json({
                    message: "Product not found",
                });
            }

            const stock =
                Number(products[0].stock || 0);

            if (
                products[0].stock !== null &&
                newQuantity > stock
            ) {
                return res.status(400).json({
                    message:
                        `Only ${stock} item(s) available`,
                });
            }

            const sql = `
                UPDATE cart_items
                SET quantity = ?
                WHERE user_id = ?
                AND product_id = ?
            `;

            db.query(
                sql,
                [
                    newQuantity,
                    user_id,
                    productId,
                ],
                (err, result) => {
                    if (err) {
                        console.error(
                            "UPDATE QUANTITY ERROR:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to update quantity",
                        });
                    }

                    if (
                        result.affectedRows === 0
                    ) {
                        return res.status(404).json({
                            message:
                                "Cart item not found",
                        });
                    }

                    res.json({
                        message:
                            "Cart quantity updated",

                        quantity:
                            newQuantity,
                    });
                }
            );
        }
    );
});


/*
=====================================================
REMOVE CART ITEM
DELETE /api/cart/:productId
=====================================================
*/

router.delete("/:productId", (req, res) => {
    const { productId } = req.params;

    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({
            message: "user_id is required",
        });
    }

    const sql = `
        DELETE FROM cart_items
        WHERE user_id = ?
        AND product_id = ?
    `;

    db.query(
        sql,
        [
            user_id,
            productId,
        ],
        (err, result) => {
            if (err) {
                console.error(
                    "REMOVE CART ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to remove cart item",
                });
            }

            if (
                result.affectedRows === 0
            ) {
                return res.status(404).json({
                    message:
                        "Cart item not found",
                });
            }

            res.json({
                message:
                    "Product removed from cart",
            });
        }
    );
});


/*
=====================================================
CLEAR CART
DELETE /api/cart
=====================================================
*/

router.delete("/", (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({
            message: "user_id is required",
        });
    }

    const sql = `
        DELETE FROM cart_items
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [user_id],
        (err) => {
            if (err) {
                console.error(
                    "CLEAR CART ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to clear cart",
                });
            }

            res.json({
                message:
                    "Cart cleared successfully",
            });
        }
    );
});


module.exports = router;