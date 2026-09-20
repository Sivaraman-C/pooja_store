import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Products.css";
import API_URL from "../../../apiConfig";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      setProducts(prev => prev.filter(p => p.id !== id));
      alert("Product deleted successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "/logo.svg";
    return image.startsWith("http") ? image : `${API_URL}${image}`;
  };

  return (
    <div className="products-admin">
      <div className="products-title">
        <div>
          <p>STORE MANAGEMENT</p>
          <h1>Products</h1>
        </div>
        <Link to="/admin/products/add" className="add-product-btn">+ Add Product</Link>
      </div>

      <div className="products-table-box">
        {loading ? (
          <div className="products-loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <h3>No products found</h3>
            <p>Add your first pooja product.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product">
                        <img src={getImageUrl(product.image)} alt="" />
                        <div>
                          <strong>{product.name}</strong>
                          <small>ID: #{product.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.brand && product.brand !== "null" ? product.brand : "Sacred Item"}</td>
                    <td>₹{Number(product.price).toLocaleString("en-IN")}</td>
                    <td>{product.stock}</td>
                    <td>{product.featured ? <span className="featured-badge">Featured</span> : "No"}</td>
                    <td>
                      <div className="product-actions">
                        <Link to={`/admin/products/edit/${product.id}`}>Edit</Link>
                        <button onClick={() => deleteProduct(product.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;