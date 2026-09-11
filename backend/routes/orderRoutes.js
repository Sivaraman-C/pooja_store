const express = require("express");
const db = require("../db");
const twilio = require("twilio");

const router = express.Router();

const sendSmsConfirmation = async ({ phone, customerName, orderId, total }) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER || "+17372508034";
    const countryCode = process.env.TWILIO_COUNTRY_CODE || "91";
    const contentSid = process.env.TWILIO_CONTENT_SID;

    if (!accountSid || !authToken || !from) {
        console.warn("SMS confirmation skipped: Twilio environment variables are not configured");
        return;
    }

    let recipient = String(phone).replace(/\D/g, "");
    if (recipient.length === 10 && countryCode) {
        recipient = `${countryCode}${recipient}`;
    }
    if (!recipient) {
        console.warn("SMS confirmation skipped: customer phone number is invalid");
        return;
    }

    const client = twilio(accountSid, authToken);

    const message = {
        from,
        to: `+${recipient}`,
    };

    if (contentSid) {
        message.contentSid = contentSid;
        message.contentVariables = JSON.stringify({
            1: customerName,
            2: String(orderId),
            3: `INR ${Number(total).toLocaleString("en-IN")}`,
        });
    } else {
        message.body = `Hello ${customerName}, your order #${orderId} has been placed successfully. Total: INR ${Number(total).toLocaleString("en-IN")}. Thank you for shopping with us!`;
    }

    await client.messages.create(message);
};

router.post("/", async (req, res) => {
    const {
        user_id: userId,
        customer_name: customerName,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        payment_method: paymentMethod,
    } = req.body;

    if (!userId || !customerName || !email || !phone || !address || !city || !state || !pincode || !paymentMethod) {
        return res.status(400).json({ message: "All checkout details are required" });
    }

    const connection = await db.promise().getConnection();

    try {
        const [cart] = await connection.query(`
            SELECT c.product_id, c.quantity, p.name, p.price
            FROM cart_items c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [userId]);

        if (cart.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }

        const total = cart.reduce(
            (sum, item) => sum + Number(item.price) * Number(item.quantity),
            0
        );

        await connection.beginTransaction();
        const [result] = await connection.query(`
            INSERT INTO orders
            (user_id, total_amount, payment_method, payment_status, order_status,
             shipping_name, shipping_phone, shipping_address, shipping_city,
             shipping_state, shipping_pincode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            total,
            paymentMethod,
            "Pending",
            "Pending",
            customerName,
            phone,
            address,
            city,
            state,
            pincode,
        ]);

        await connection.query(`
            INSERT INTO order_items
            (order_id, product_id, quantity, price, total)
            VALUES ?
        `, [cart.map((item) => [
            result.insertId,
            item.product_id,
            item.quantity,
            item.price,
            Number(item.price) * Number(item.quantity),
        ])]);

        await connection.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
        await connection.commit();

        let smsSent = false;
        try {
            await sendSmsConfirmation({
                phone,
                customerName,
                orderId: result.insertId,
                total,
            });
            smsSent = true;
        } catch (smsError) {
            console.error("SMS CONFIRMATION ERROR:", smsError.message);
        }

        res.status(201).json({
            message: "Order placed successfully",
            sms_sent: smsSent,
            order: { id: result.insertId, total },
        });
    } catch (error) {
        await connection.rollback();
        console.error("CREATE ORDER ERROR:", error);
        res.status(500).json({ message: "Unable to place order" });
    } finally {
        connection.release();
    }
});

router.get("/", async (req, res) => {
    const userId = req.query.user_id;

    try {
        let query = `
            SELECT id, user_id, total_amount AS total,
                   payment_method, payment_status,
                   order_status AS status,
                   shipping_name AS customer_name,
                   created_at
            FROM orders
        `;
        const params = [];

        if (userId) {
            query += " WHERE user_id = ?";
            params.push(userId);
        }

        query += " ORDER BY created_at DESC";

        const [orders] = await db.promise().query(query, params);
        res.json(orders);
    } catch (error) {
        console.error("GET ORDERS ERROR:", error);
        res.status(500).json({ message: "Unable to fetch orders" });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const [orders] = await db.promise().query(
            `SELECT id, user_id, total_amount AS total,
                    payment_method, payment_status,
                    order_status AS status,
                    shipping_name AS customer_name,
                    created_at
             FROM orders
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.params.userId]
        );

        res.json(orders);
    } catch (error) {
        console.error("GET USER ORDERS ERROR:", error);
        res.status(500).json({ message: "Unable to fetch user orders" });
    }
});

router.get("/items", async (req, res) => {
    try {
        const [items] = await db.promise().query(
            `SELECT oi.id, oi.order_id, oi.product_id,
                    COALESCE(p.name, CONCAT('Product #', oi.product_id)) AS product_name,
                    p.image AS product_image,
                    oi.quantity,
                    oi.price, oi.total, o.shipping_name AS customer_name,
                    o.created_at
             FROM order_items oi
             LEFT JOIN orders o ON o.id = oi.order_id
             LEFT JOIN products p ON p.id = oi.product_id
             ORDER BY oi.created_at DESC`
        );
        res.json(items);
    } catch (error) {
        console.error("GET ORDER ITEMS ERROR:", error);
        res.status(500).json({ message: "Unable to fetch order items" });
    }
});

router.get("/:id/items", async (req, res) => {
    try {
        const [items] = await db.promise().query(
            `SELECT oi.id, oi.order_id, oi.product_id,
                    COALESCE(p.name, CONCAT('Product #', oi.product_id)) AS product_name,
                    p.image AS product_image,
                    oi.quantity,
                    oi.price, oi.total, o.shipping_name AS customer_name,
                    o.created_at
             FROM order_items oi
             LEFT JOIN orders o ON o.id = oi.order_id
             LEFT JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ?
             ORDER BY oi.created_at DESC`,
            [req.params.id]
        );

        res.json(items);
    } catch (error) {
        console.error("GET ORDER DETAILS ERROR:", error);
        res.status(500).json({ message: "Unable to fetch order details" });
    }
});

router.put("/:id", async (req, res) => {
    const { status } = req.body;

    try {
        const [result] = await db.promise().query(
            "UPDATE orders SET order_status = ? WHERE id = ?",
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order status updated" });
    } catch (error) {
        console.error("UPDATE ORDER ERROR:", error);
        res.status(500).json({ message: "Unable to update order" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.promise().query(
            "DELETE FROM orders WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("DELETE ORDER ERROR:", error);
        res.status(500).json({ message: "Unable to delete order" });
    }
});

module.exports = router;