import React, { useState } from "react";
import "./AddProduct.css";
import API_URL from "../../../apiConfig";

const brandMapping = {
  "Idols": ["Devaloka Artisans", "Vedic Crafts", "Divine Statues", "Ancient Heritage"],
  "Diyas": ["Golden Glow", "Deepam Lights", "Sacred Flame", "Eternal Light"],
  "Incense": ["Mysore Deep Perfumery House (MDPH)", "Cycle Pure Agarbatti", "Mangaldeep", "Zed Black","HEM","Hari Darshan", "Moksh Agarbatti", "Satya","Shalimar", "Phool", "Patanjali", "Nandi"],
  "Pooja Kits": ["Daily Ritual", "Festive Special", "Complete Devotion", "Pilgrim Pack"],
  "Pooja Essentials": ["Purity First", "Ritual Needs", "Sacred Supplies", "Holy Offerings"]
};

const AddProduct = () => {

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    stock: "",
    featured: false,
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Reset brand if category changes
      if (name === "category") {
        newData.brand = "";
      }

      return newData;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("brand", formData.brand);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("featured", formData.featured);

      if (image) {
        data.append("image", image);
      }

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add product");
      }

      setMessage("Product added successfully!");
      setShowSuccessPopup(true);

      setFormData({
        name: "",
        category: "",
        brand: "",
        description: "",
        price: "",
        stock: "",
        featured: false,
      });

      setImage(null);
      const fileInput = document.getElementById("product-image");
      if (fileInput) fileInput.value = "";

    } catch (error) {
      setShowSuccessPopup(false);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <h1>Add Product</h1>
        <p className="page-description">
          Add a new pooja product to your Devaloka store.
        </p>

        {message && (
          <div className="product-message">
            {message}
          </div>
        )}

        {showSuccessPopup && (
          <div className="product-success-overlay" onClick={() => setShowSuccessPopup(false)}>
            <div className="product-success-popup" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <button className="product-success-close" onClick={() => setShowSuccessPopup(false)}>&times;</button>
              <div className="product-success-icon">&#10003;</div>
              <h2>Product Added Successfully</h2>
              <p>Your product is now available in the store.</p>
              <button className="product-success-button" onClick={() => setShowSuccessPopup(false)}>Done</button>
            </div>
          </div>
        )}

        <form className="add-product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" name="name" placeholder="Brass Ganesha Idol" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                <option value="Idols">Idols</option>
                <option value="Diyas">Diyas</option>
                <option value="Incense">Incense</option>
                <option value="Pooja Kits">Pooja Kits</option>
                <option value="Pooja Essentials">Pooja Essentials</option>
              </select>
            </div>

            {/* Brand Dropdown - only shows when category is selected */}
            {formData.category && (
              <div className="form-group">
                <label>Brand</label>
                <select name="brand" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select Brand</option>
                  {brandMapping[formData.category]?.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" placeholder="Product description..." rows="5" value={formData.description} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input type="number" name="price" placeholder="1499" min="0" step="0.01" value={formData.price} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="stock" placeholder="25" min="0" value={formData.stock} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input id="product-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImage(e.target.files[0])} required />
          </div>

          <div className="featured-checkbox">
            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
            <label>Show this product in Featured Products</label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;