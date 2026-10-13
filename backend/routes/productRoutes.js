const express = require("express");
const multer = require("multer");
const db = require("../db");
const { productStorage } = require("../cloudinaryConfig");

const router = express.Router();

const upload = multer({
  storage: productStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
const uploadProductImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 8 },
]);

const getStoredImages = (value, fallbackImage) => {
  let images = value;
  if (typeof images === "string") {
    try {
      images = JSON.parse(images);
    } catch {
      images = [];
    }
  }

  const storedImages = Array.isArray(images)
    ? images.filter((image) => typeof image === "string" && image)
    : [];
  if (storedImages.length > 0) return [...new Set(storedImages)];
  return fallbackImage ? [fallbackImage] : [];
};


/* =========================
   ADD PRODUCT
========================= */

router.post("/", uploadProductImages, (req, res) => {
    console.log("POST /api/products - BODY:", req.body);

    const {
      name,
      category,
      brand,
      description,
      price,
      stock,
      featured,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: "Name, category and price are required" });
    }

    const legacyImage = req.files?.image?.[0]?.path;
    const uploadedImages = (req.files?.images || []).map((file) => file.path);
    const images = [...new Set([
      ...(legacyImage ? [legacyImage] : []),
      ...uploadedImages,
    ])];
    if (images.length > 8) {
      return res.status(400).json({ message: "A product can have up to 8 photos." });
    }
    const image = images[0] || null;

    const sql = `
      INSERT INTO products (name, category, brand, description, price, stock, image, images, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      category,
      brand || null,
      description || "",
      Number(price),
      Number(stock) || 0,
      image,
      images.length > 0 ? JSON.stringify(images) : null,
      featured === "true" || featured === "1" ? 1 : 0,
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
          console.error("DATABASE INSERT ERROR:", err);
          if (err.code === "ER_BAD_FIELD_ERROR" && /images/i.test(err.message)) {
            return res.status(503).json({
              message: "Product photo database setup is incomplete. Run `npm run migrate:product-images` from the backend directory, then retry.",
            });
          }
          return res.status(500).json({ message: "Failed to add product", error: err.message });
        }
        res.status(201).json({ message: "Product added successfully", productId: result.insertId });
      }
    );
});


/* =========================
   GET ALL PRODUCTS
========================= */

router.get("/", (req, res) => {
    const sql = `SELECT * FROM products ORDER BY created_at DESC`;
    db.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch products", error: err.message });
      }
      res.json(results);
    });
});


/* =========================
   GET FEATURED PRODUCTS
========================= */

router.get("/featured", (req, res) => {
    const sql = `SELECT * FROM products WHERE featured = 1 ORDER BY created_at DESC LIMIT 20`;
    db.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch featured products", error: err.message });
      }
      res.json(results);
    });
});

/* =========================
   DASHBOARD STATS
========================= */

router.get("/stats", (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS totalProducts,
      SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) AS featuredProducts,
      COALESCE(SUM(stock), 0) AS totalStock
    FROM products
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
    const data = results[0];
    res.json({
      products: Number(data.totalProducts),
      featured: Number(data.featuredProducts),
      stock: Number(data.totalStock),
      status: "Online",
    });
  });
});

/* =========================
   GET SINGLE PRODUCT
========================= */

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM products WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch product", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(results[0]);
  });
});


/* =========================
   UPDATE PRODUCT
========================= */

router.put("/:id", uploadProductImages, (req, res) => {
    const { id } = req.params;
    console.log(`PUT /api/products/${id} - BODY:`, req.body);

    const {
      name,
      category,
      brand,
      description,
      price,
      stock,
      featured,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: "Name, category and price are required" });
    }

    let keptImages;
    if (req.body.keepImages !== undefined) {
      try {
        keptImages = JSON.parse(req.body.keepImages);
        if (!Array.isArray(keptImages) || keptImages.some((image) => typeof image !== "string")) {
          throw new Error("The retained images list is invalid.");
        }
      } catch (error) {
        return res.status(400).json({ message: error.message || "The retained images list is invalid." });
      }
    }

    db.query("SELECT image, images FROM products WHERE id = ?", [id], (selectError, products) => {
      if (selectError) {
        console.error("DATABASE PRODUCT LOOKUP ERROR:", selectError);
        return res.status(500).json({ message: "Failed to update product", error: selectError.message });
      }

      if (products.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const uploadedImages = (req.files?.images || []).map((file) => file.path);
      const legacyImage = req.files?.image?.[0]?.path;
      const currentImages = getStoredImages(products[0].images, products[0].image);
      const baseImages = keptImages || (legacyImage ? [] : currentImages);
      const hasImageChanges =
        keptImages !== undefined || uploadedImages.length > 0 || Boolean(legacyImage);
      const images = hasImageChanges
        ? [...new Set([
            ...baseImages,
            ...uploadedImages,
            ...(legacyImage ? [legacyImage] : []),
          ])]
        : currentImages;
      if (hasImageChanges && images.length > 8) {
        return res.status(400).json({ message: "A product can have up to 8 photos." });
      }
      const image = images[0] || null;
      const sql = `
        UPDATE products
        SET name = ?, category = ?, brand = ?, description = ?, price = ?, stock = ?, image = ?, images = ?, featured = ?
        WHERE id = ?
      `;
      const values = [
        name,
        category,
        brand || null,
        description || "",
        Number(price),
        Number(stock) || 0,
        image,
        images.length > 0 ? JSON.stringify(images) : null,
        featured === "true" || featured === "1" ? 1 : 0,
        id,
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("DATABASE UPDATE ERROR:", err);
          return res.status(500).json({ message: "Failed to update product", error: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product updated successfully" });
      });
    });
});


/* =========================
   DELETE PRODUCT
========================= */

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT COUNT(*) AS orderCount FROM order_items WHERE product_id = ?",
    [id],
    (countError, countResults) => {
      if (countError) {
        return res.status(500).json({ message: "Failed to check product orders" });
      }
      if (Number(countResults[0].orderCount) > 0) {
        return res.status(409).json({ message: "This product cannot be deleted because it is included in an order." });
      }
      const sql = `DELETE FROM products WHERE id = ?`;
      db.query(sql, [id], (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Failed to delete product", error: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
      });
    }
  );
});

module.exports = router;