import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditProduct.css";
import API_URL from "../../../apiConfig";

const brandMapping = {
  "Idols": ["Devaloka Artisans", "Vedic Crafts", "Divine Statues", "Ancient Heritage"],
  "Diyas": ["Golden Glow", "Deepam Lights", "Sacred Flame", "Eternal Light"],
  "Incense": ["Mysore Sandal", "Fragrant Purity", "Vedic Incense", "Temple Aroma"],
  "Pooja Kits": ["Daily Ritual", "Festive Special", "Complete Devotion", "Pilgrim Pack"],
  "Pooja Essentials": ["Purity First", "Ritual Needs", "Sacred Supplies", "Holy Offerings"]
};

const EditProduct = () => {

  const { id } = useParams();
  const navigate = useNavigate();

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
  const [currentImage, setCurrentImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch product");
        }

        setFormData({
          name: data.name || "",
          category: data.category || "",
          brand: data.brand || "",
          description: data.description || "",
          price: data.price || "",
          stock: data.stock || "",
          featured: Boolean(data.featured),
        });

        setCurrentImage(data.image || "");

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "category") {
        newData.brand = "";
      }

      return newData;
    });
  };


  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("brand", formData.brand);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("featured", formData.featured ? "1" : "0");

      if (image) {
        data.append("image", image);
      }

      const response = await fetch(`${API_URL}/api/products/${id}`, {
          method: "PUT",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update product");
      }

      setSuccess("Product updated successfully!");
      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);

    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="edit-product">
        <p>Loading product...</p>
      </div>
    );
  }


  return (
    <div className="edit-product">
      <div className="edit-product-title">
        <div>
          <p>STORE MANAGEMENT</p>
          <h1>Edit Product</h1>
        </div>
      </div>

      <div className="edit-product-box">
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
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
            <textarea name="description" value={formData.description} onChange={handleChange} rows="5" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" required />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" />
            </div>
          </div>

          {currentImage && (
            <div className="current-image">
              <label>Current Image</label>
              <img src={currentImage.startsWith("http") ? currentImage : `${API_URL}${currentImage}`} alt={formData.name} />
            </div>
          )}

          <div className="form-group">
            <label>Change Product Image</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
            <small>Leave empty to keep the current image.</small>
          </div>

          <div className="featured-check">
            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} id="featured" />
            <label htmlFor="featured">Show this product in Featured Products</label>
          </div>

          <div className="edit-buttons">
            <button type="button" className="cancel-btn" onClick={() => navigate("/admin/products")}>Cancel</button>
            <button type="submit" className="update-btn" disabled={saving}>{saving ? "Updating..." : "Update Product"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;