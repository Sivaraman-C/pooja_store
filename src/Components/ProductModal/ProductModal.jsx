import React, { useState } from "react";
import "./ProductModal.css";
import API_URL from "../../apiConfig";
import { useNavigate } from "react-router-dom";

const ProductModal = ({ product, onClose, onAddToCart, allProducts = [] }) => {
  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [currentProduct, setCurrentProduct] = useState(product);
  const navigate = useNavigate();

  if (!currentProduct) return null;

  const imageUrl = currentProduct.image.startsWith("http") ? currentProduct.image : `${API_URL}${currentProduct.image}`;
  const thumbnails = [imageUrl, imageUrl, imageUrl, imageUrl];

  const sameCategoryProducts = allProducts.filter(
    p => p.id !== currentProduct.id && String(p.category || "").toLowerCase() === String(currentProduct.category || "").toLowerCase()
  );
  const otherProducts = allProducts.filter(
    p => p.id !== currentProduct.id && String(p.category || "").toLowerCase() !== String(currentProduct.category || "").toLowerCase()
  );
  const relatedProducts = [...sameCategoryProducts, ...otherProducts];

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="product-modal-close" onClick={onClose}>×</button>

        {/* TOP PRODUCT DETAILS SECTION */}
        <div className="product-modal-top">
          <div className="product-modal-gallery">
            <div className="product-modal-thumbs">
              {thumbnails.map((thumb, idx) => (
                <div key={idx} className="thumb-item" onClick={() => setSelectedImage(thumb)}>
                  <img src={thumb} alt="" />
                </div>
              ))}
            </div>
            <div className="product-modal-main-img">
              <img src={selectedImage || imageUrl} alt={currentProduct.name} />
              <button className="favorite-badge">❤️</button>
            </div>
          </div>

          <div className="product-modal-info">
            <h2>{currentProduct.name}</h2>
            <div className="product-modal-rating">
              <span className="stars">★★★★☆</span>
              <span className="rating-num">4.5 (124 reviews)</span>
            </div>

            <div className="product-modal-price-row">
              <span className="price-current">₹{Number(currentProduct.price).toLocaleString("en-IN")}</span>
              <span className="price-old">₹{Math.round(Number(currentProduct.price) * 1.4).toLocaleString("en-IN")}</span>
              <span className="discount-badge">29% OFF</span>
            </div>

            <p className="product-modal-summary">
              {currentProduct.description || "Traditional brass diya set for your daily pooja and special occasions. Brings positivity and divine energy to your home."}
            </p>

            <div className="product-modal-qty-actions">
              <div className="modal-qty-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button className="modal-add-cart-btn" onClick={() => { onAddToCart(currentProduct, quantity); onClose(); }}>
                Add to Cart
              </button>
              <button className="modal-buy-now-btn" onClick={() => { onAddToCart(currentProduct, quantity); onClose(); navigate("/checkout"); }}>
                Buy Now
              </button>
            </div>

            <div className="product-modal-features">
              <span>🪔 Pure Quality</span>
              <span>🪷 Traditional Design</span>
              <span>📦 Secure Packaging</span>
            </div>
          </div>
        </div>

        {/* TABS & DESCRIPTION SECTION */}
        <div className="product-modal-tabs-section">
          <div className="modal-tabs-header">
            <button className={activeTab === "description" ? "active" : ""} onClick={() => setActiveTab("description")}>Description</button>
            <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>Reviews (124)</button>
            <button className={activeTab === "shipping" ? "active" : ""} onClick={() => setActiveTab("shipping")}>Shipping & Returns</button>
          </div>

          <div className="modal-tabs-body">
            {activeTab === "description" && (
              <div>
                <p>{currentProduct.description || "This beautiful item is perfect for daily use, festivals and special poojas. Crafted with high quality materials, it ensures long life and adds a traditional touch to your home temple."}</p>
                <h4>Set includes:</h4>
                <ul>
                  <li>Authentic sacred craftsmanship</li>
                  <li>Ideal for home temple and special rituals</li>
                  <li>Easy to clean and maintain</li>
                </ul>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="modal-reviews-tab">
                <p>⭐️⭐️⭐️⭐️⭐️ "Very beautiful and premium quality. Loved it!" - Ramesh K.</p>
                <p>⭐️⭐️⭐️⭐️⭐️ "Exceeded my expectations. Fast delivery." - Priya S.</p>
              </div>
            )}
            {activeTab === "shipping" && (
              <div className="modal-shipping-tab">
                <p>Free standard shipping on orders over ₹499. Arrives within 3-5 business days. Easy 7-day return policy.</p>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION (SHOWN WHEN SCROLLING DOWN) */}
        <div className="product-modal-related-section">
          <h3>Related Products</h3>
          <div className="modal-related-grid">
            {relatedProducts.map((item) => {
              const itemImg = item.image.startsWith("http") ? item.image : `${API_URL}${item.image}`;
              return (
                <div key={item.id} className="modal-related-card" onClick={() => { setCurrentProduct(item); setSelectedImage(itemImg); }}>
                  <img src={itemImg} alt={item.name} />
                  <h5>{item.name}</h5>
                  <span className="related-price">₹{Number(item.price).toLocaleString("en-IN")}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductModal;
