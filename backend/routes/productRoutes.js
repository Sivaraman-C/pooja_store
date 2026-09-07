const express = require("express");
const multer = require("multer");
const db = require("../db");
const { productStorage } = require("../cloudinaryConfig");

const router = express.Router();

/* =========================
   IMAGE UPLOAD
========================= */

const upload = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


/* =========================
   ADD PRODUCT
========================= */

router.post(
  "/",
  upload.single("image"),
  (req, res) => {

    console.log(
      "POST /api/products"
    );

    console.log(
      "BODY:",
      req.body
    );

    console.log(
      "FILE:",
      req.file
    );


    const {
      name,
      category,
      description,
      price,
      stock,
      featured,
    } = req.body;


    if (!name || !category || !price) {

      return res.status(400).json({

        message:
          "Name, category and price are required",

      });

    }


    const image = req.file ? req.file.path : null;


    const sql = `
      INSERT INTO products
      (
        name,
        category,
        description,
        price,
        stock,
        image,
        featured
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [

      name,

      category,

      description || "",

      Number(price),

      Number(stock) || 0,

      image,

      featured === "true" ||
      featured === "1"
        ? 1
        : 0,

    ];


    db.query(
      sql,
      values,
      (err, result) => {

        if (err) {

          console.error(
            "DATABASE ERROR:",
            err
          );

          return res.status(500).json({

            message:
              "Failed to add product",

            error:
              err.message,

          });

        }


        console.log(
          "Product inserted:",
          result.insertId
        );


        res.status(201).json({

          message:
            "Product added successfully",

          productId:
            result.insertId,

        });

      }
    );

  }
);


/* =========================
   GET ALL PRODUCTS
========================= */

router.get(
  "/",
  (req, res) => {

    const sql = `
      SELECT *
      FROM products
      ORDER BY created_at DESC
    `;


    db.query(
      sql,
      (err, results) => {

        if (err) {

          console.error(
            "GET PRODUCTS ERROR:",
            err
          );

          return res.status(500).json({

            message:
              "Failed to fetch products",

            error:
              err.message,

          });

        }


        res.json(results);

      }
    );

  }
);


/* =========================
   GET FEATURED PRODUCTS
========================= */

router.get(
  "/featured",
  (req, res) => {

    const sql = `
      SELECT *
      FROM products
      WHERE featured = 1
      ORDER BY created_at DESC
      LIMIT 4
    `;


    db.query(
      sql,
      (err, results) => {

        if (err) {

          console.error(
            "FEATURED PRODUCTS ERROR:",
            err
          );

          return res.status(500).json({

            message:
              "Failed to fetch featured products",

            error:
              err.message,

          });

        }


        res.json(results);

      }
    );

  }
);

/* =========================
   DASHBOARD STATS
========================= */

router.get("/stats", (req, res) => {

  const sql = `
    SELECT
      COUNT(*) AS totalProducts,

      SUM(
        CASE
          WHEN featured = 1 THEN 1
          ELSE 0
        END
      ) AS featuredProducts,

      COALESCE(SUM(stock), 0) AS totalStock

    FROM products
  `;

  db.query(sql, (err, results) => {

    if (err) {

      console.error(
        "Dashboard stats error:",
        err
      );

      return res.status(500).json({
        message: "Failed to fetch dashboard stats",
      });

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

  const sql = `
    SELECT *
    FROM products
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {

    if (err) {
      console.error("GET PRODUCT ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch product",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(results[0]);
  });
});


/* =========================
   UPDATE PRODUCT
========================= */

router.put(
  "/:id",
  upload.single("image"),
  (req, res) => {

    const { id } = req.params;

    const {
      name,
      category,
      description,
      price,
      stock,
      featured,
    } = req.body;

    console.log("UPDATE PRODUCT ID:", id);
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);


    if (!name || !category || !price) {

      return res.status(400).json({
        message: "Name, category and price are required",
      });

    }


    // If new image is uploaded
    if (req.file) {

      const image = req.file.path;

      const sql = `
        UPDATE products
        SET
          name = ?,
          category = ?,
          description = ?,
          price = ?,
          stock = ?,
          image = ?,
          featured = ?
        WHERE id = ?
      `;

      const values = [
        name,
        category,
        description || "",
        Number(price),
        Number(stock) || 0,
        image,
        featured === "true" || featured === "1" ? 1 : 0,
        id,
      ];

      db.query(sql, values, (err, result) => {

        if (err) {

          console.error(
            "UPDATE PRODUCT ERROR:",
            err
          );

          return res.status(500).json({
            message: "Failed to update product",
            error: err.message,
          });

        }

        if (result.affectedRows === 0) {

          return res.status(404).json({
            message: "Product not found",
          });

        }

        res.json({
          message: "Product updated successfully",
        });

      });

    } else {

      // No new image
      // Keep existing image

      const sql = `
        UPDATE products
        SET
          name = ?,
          category = ?,
          description = ?,
          price = ?,
          stock = ?,
          featured = ?
        WHERE id = ?
      `;

      const values = [
        name,
        category,
        description || "",
        Number(price),
        Number(stock) || 0,
        featured === "true" || featured === "1" ? 1 : 0,
        id,
      ];

      db.query(sql, values, (err, result) => {

        if (err) {

          console.error(
            "UPDATE PRODUCT ERROR:",
            err
          );

          return res.status(500).json({
            message: "Failed to update product",
            error: err.message,
          });

        }

        if (result.affectedRows === 0) {

          return res.status(404).json({
            message: "Product not found",
          });

        }

        res.json({
          message: "Product updated successfully",
        });

      });

    }

  }
);


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
        console.error("CHECK PRODUCT ORDERS ERROR:", countError);
        return res.status(500).json({
          message: "Failed to check product orders",
        });
      }

      if (Number(countResults[0].orderCount) > 0) {
        return res.status(409).json({
          message: "This product cannot be deleted because it is included in an order.",
        });
      }

      const sql = `
        DELETE FROM products
        WHERE id = ?
      `;

      db.query(sql, [id], (err, result) => {

    if (err) {

      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );

      return res.status(500).json({
        message: "Failed to delete product",
        error: err.message,
      });

    }

    if (result.affectedRows === 0) {

      return res.status(404).json({
        message: "Product not found",
      });

    }

    res.json({
      message: "Product deleted successfully",
    });

      });
    }
  );

});



module.exports = router;