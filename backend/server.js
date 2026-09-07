
const express = require("express");
const cors = require("cors");
const path = require("path");

// Load .env only if it exists
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const app = express();

// Render uses port 10000 by default, or process.env.PORT
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-user-role", "Bypass-Tunnel-Reminder", "ngrok-skip-browser-warning", "Accept", "Authorization"]
}));

app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));

/* =========================
   AUTH
========================= */

app.use(
  "/api/auth",
  authRoutes
);

/* =========================
   CART ROUTES
========================= */

app.use(
  "/api/cart",
  cartRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

/* =========================
   STATIC UPLOADS
========================= */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


/* =========================
   API ROUTES
========================= */

app.use(
  "/api/products",
  productRoutes
);

/* =========================
   CATEGORY ROUTES
========================= */

app.use(
    "/api/categories",
    categoryRoutes
);


/* =========================
   CUSTOMER ROUTES
========================= */

app.use(
    "/api/customers",
    customerRoutes
);

app.use((error, req, res, next) => {
  if (error) {
    console.error("REQUEST ERROR:", error);

    return res.status(error.code === "LIMIT_FILE_SIZE" ? 400 : 500).json({
      message: error.message || "Request failed",
      error: error
    });
  }

  next();
});


/* =========================
   TEST
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Devaloka API running",
    db_host: process.env.DB_HOST ? "Configured" : "Not Set"
  });
});


/* =========================
   SERVER
========================= */

// Listen on 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});