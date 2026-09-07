const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const db = require("../db");
const twilio = require("twilio");
const { profileStorage } = require("../cloudinaryConfig");

const router = express.Router();

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.headers["x-user-role"])) {
        return res.status(403).json({ message: "You do not have permission" });
    }
    next();
};

const profileImageUpload = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const sendSmsOtp = async (phone, otp) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    const countryCode = process.env.TWILIO_COUNTRY_CODE || "91";

    if (!accountSid || !authToken || !from) {
        console.warn("SMS OTP skipped: Twilio credentials missing");
        return false;
    }

    try {
        const client = twilio(accountSid, authToken);
        let recipient = String(phone).replace(/\D/g, "");
        if (recipient.length === 10) recipient = `${countryCode}${recipient}`;
        await client.messages.create({
            body: `Your Devaloka verification code is: ${otp}. Valid for 5 minutes.`,
            from: from,
            to: `+${recipient}`
        });
        return true;
    } catch (error) {
        console.error("TWILIO OTP ERROR:", error.message);
        return false;
    }
};

// =====================================================
// OTP FOR REGISTRATION
// =====================================================
router.post("/send-otp", (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    db.query("INSERT INTO otps (phone, otp) VALUES (?, ?) ON DUPLICATE KEY UPDATE otp = ?, created_at = CURRENT_TIMESTAMP",
    [phone, otp, otp], async (err) => {
        if (err) return res.status(500).json({ message: "Database error" });

        const smsSent = await sendSmsOtp(phone, otp);
        console.log(`[REGISTRATION OTP] ${phone}: ${otp}`);

        res.json({ message: "OTP sent successfully", mockOtp: otp, smsSent });
    });
});

// =====================================================
// OTP FOR LOGIN (VERIFIES PASSWORD FIRST)
// =====================================================
router.post("/login-otp", (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or phone
    if (!identifier || !password) return res.status(400).json({ message: "Identifier and password required" });

    db.query("SELECT * FROM users WHERE email = ? OR phone = ?", [identifier, identifier], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        db.query("UPDATE users SET otp = ?, otp_created_at = CURRENT_TIMESTAMP WHERE id = ?", [otp, user.id], async (updateErr) => {
            if (updateErr) return res.status(500).json({ message: "Failed to set OTP" });

            const smsSent = await sendSmsOtp(user.phone, otp);
            console.log(`[LOGIN OTP] ${user.phone}: ${otp}`);
            res.json({ message: "OTP sent to your registered phone", mockOtp: otp, smsSent });
        });
    });
});

// =====================================================
// VERIFY OTP (WORKS FOR BOTH)
// =====================================================
router.post("/verify-otp", (req, res) => {
    const { phone, identifier, otp, type } = req.body; // type: 'login' or 'register'

    if (type === 'login') {
        const sql = "SELECT * FROM users WHERE (email = ? OR phone = ?) AND otp = ? AND otp_created_at >= NOW() - INTERVAL 5 MINUTE";
        db.query(sql, [identifier, identifier, otp], (err, results) => {
            if (results && results.length > 0) {
                const user = results[0];
                db.query("UPDATE users SET otp = NULL WHERE id = ?", [user.id]);
                res.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email, role: user.role, pincode: user.pincode, profileImage: user.profile_image || "" }, token: "mock-token" });
            } else {
                res.status(400).json({ message: "Invalid or expired OTP" });
            }
        });
    } else {
        const sql = "SELECT * FROM otps WHERE phone = ? AND otp = ? AND created_at >= NOW() - INTERVAL 5 MINUTE";
        db.query(sql, [phone, otp], (err, results) => {
            if (results && results.length > 0) {
                res.json({ message: "OTP verified" });
            } else {
                res.status(400).json({ message: "Invalid or expired OTP" });
            }
        });
    }
});

router.post("/register", async (req, res) => {
    const { name, email, password, phone, pincode, city, state } = req.body;
    if (!name || !email || !password || !phone || !pincode) return res.status(400).json({ message: "Required fields are missing" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (name, email, password, phone, pincode, city, state, role) VALUES (?, ?, ?, ?, ?, ?, ?, 'user')";
        db.query(sql, [name, email, hashedPassword, phone, pincode, city || "", state || ""], (err) => {
            if (err) {
                console.error("REGISTER ERROR:", err);
                return res.status(409).json({ message: "Email or Phone already exists" });
            }
            res.status(201).json({ message: "Registered successfully" });
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/profile/:id", (req, res) => {
    db.query("SELECT id, name, email, phone, address, city, state, pincode, profile_image, role FROM users WHERE id = ?", [req.params.id], (err, results) => {
        if (results.length === 0) return res.status(404).json({ message: "User not found" });
        res.json({ user: results[0] });
    });
});

router.put("/profile/:id", profileImageUpload.single("profileImage"), (req, res) => {
    const { name, email, phone, address, city, state, pincode } = req.body;
    const sql = "UPDATE users SET name=?, email=?, phone=?, address=?, city=?, state=?, pincode=?, profile_image=COALESCE(?, profile_image) WHERE id=?";
    db.query(sql, [name, email, phone, address, city, state, pincode, req.file ? req.file.path : null, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Failed to update profile" });

        db.query("SELECT id, name, email, phone, address, city, state, pincode, profile_image, role FROM users WHERE id = ?", [req.params.id], (selectErr, results) => {
            if (selectErr || results.length === 0) return res.status(500).json({ message: "Failed to load updated profile" });
            res.json({ message: "Profile updated", user: results[0] });
        });
    });
});

// TEST ROUTE FOR CLOUDINARY
router.get("/test-cloud", (req, res) => {
    res.json({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "Found" : "Missing",
        api_key: process.env.CLOUDINARY_API_KEY ? "Found" : "Missing",
        api_secret: process.env.CLOUDINARY_API_SECRET ? "Found" : "Missing",
        env_loaded: !!process.env.PORT
    });
});

// =====================================================
// ADMIN USER MANAGEMENT
// =====================================================

router.post("/admin/users", requireRole("super_admin", "admin"), async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

        db.query(sql, [name, email, hashedPassword, role], (err, result) => {
            if (err) {
                console.error("ADMIN CREATE USER ERROR:", err);
                return res.status(409).json({ message: "Email already exists" });
            }
            res.status(201).json({
                message: "User created successfully",
                user: { id: result.insertId, name, email, role }
            });
        });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/admin/users", requireRole("super_admin", "admin"), (req, res) => {
    db.query(
        "SELECT id, name, email, role FROM users ORDER BY id DESC",
        (err, results) => err
            ? res.status(500).json({ message: "Failed to fetch users" })
            : res.json(results)
    );
});

router.put("/admin/users/:id", requireRole("super_admin", "admin"), (req, res) => {
    const { name, email, role } = req.body;
    db.query(
        "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
        [name, email, role, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Update failed" });
            res.json({ message: "User updated successfully" });
        }
    );
});

router.delete("/admin/users/:id", requireRole("super_admin", "admin"), (req, res) => {
    db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Delete failed" });
        res.json({ message: "User deleted successfully" });
    });
});

module.exports = router;
