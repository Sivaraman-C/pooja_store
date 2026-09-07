import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditProduct.css";

import API_URL from "../../../apiConfig";

const EditProduct = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
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


  /* =========================
     FETCH PRODUCT
  ========================= */

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const response = await fetch(`${API_URL}/api/products/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch product"
          );
        }

        setFormData({
          name: data.name || "",
          category: data.category || "",
          description: data.description || "",
          price: data.price || "",
          stock: data.stock || "",
          featured: Boolean(data.featured),
        });

        setCurrentImage(data.image || "");

      } catch (error) {

        console.error(error);
        setError(error.message);

      } finally {

        setLoading(false);

      }

    };

    fetchProduct();

  }, [id]);


  /* =========================
     HANDLE INPUT
  ========================= */

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox"
        ? checked
        : value,
    });

  };


  /* =========================
     HANDLE IMAGE
  ========================= */

  const handleImageChange = (e) => {

    setImage(e.target.files[0]);

  };


  /* =========================
     UPDATE PRODUCT
  ========================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);


    try {

      const data = new FormData();

      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append(
        "featured",
        formData.featured ? "1" : "0"
      );

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

        throw new Error(
          result.message ||
          "Failed to update product"
        );

      }


      setSuccess(
        "Product updated successfully!"
      );


      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);


    } catch (error) {

      console.error(error);

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


        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        {success && (
          <div className="form-success">
            {success}
          </div>
        )}


        <form onSubmit={handleSubmit}>


          {/* PRODUCT NAME */}

          <div className="form-group">

            <label>
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

          </div>


          {/* CATEGORY */}

          <div className="form-group">

            <label>
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Category
              </option>

              <option value="Idols">
                Idols & Murtis
              </option>

              <option value="Diyas">
                Diyas & Lamps
              </option>

              <option value="Incense">
                Incense
              </option>

              <option value="Essentials">
                Essentials
              </option>

            </select>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
            />

          </div>


          {/* PRICE + STOCK */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Price
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
              />

            </div>

          </div>


          {/* CURRENT IMAGE */}

          {currentImage && (

            <div className="current-image">

              <label>
                Current Image
              </label>

              <img
                src={currentImage.startsWith("http") ? currentImage : `${API_URL}${currentImage}`}
                alt={formData.name}
              />

            </div>

          )}


          {/* NEW IMAGE */}

          <div className="form-group">

            <label>
              Change Product Image
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
            />

            <small>
              Leave empty to keep the current image.
            </small>

          </div>


          {/* FEATURED */}

          <div className="featured-check">

            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              id="featured"
            />

            <label htmlFor="featured">
              Show this product in Featured Products
            </label>

          </div>


          {/* BUTTONS */}

          <div className="edit-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate("/admin/products")
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="update-btn"
              disabled={saving}
            >

              {saving
                ? "Updating..."
                : "Update Product"}

            </button>

          </div>


        </form>

      </div>

    </div>

  );

};

export default EditProduct;