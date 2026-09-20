import React, { useEffect, useState } from "react";
import "./Featured.css";
import { Link } from "react-router-dom";

import LoginPopup from "../LoginPopup/LoginPopup";
import API_URL, { bypassHeaders } from "../../apiConfig";

const Featured = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);
  const [cartMap, setCartMap] = useState({}); // productId -> quantity

  const getLoggedInUser = () => {
    const user = localStorage.getItem("user");
    try { return user ? JSON.parse(user) : null; } catch { return null; }
  };

  const getUserId = () => {
    const user = getLoggedInUser();
    return user?.id || user?.user_id || null;
  };

  const fetchCart = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart?user_id=${userId}`, {
        headers: { ...bypassHeaders }
      });
      const data = await response.json();
      if (response.ok && data.cart) {
        const mapping = {};
        data.cart.forEach(item => { mapping[item.product_id] = item.quantity; });
        setCartMap(mapping);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/featured`);
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {} finally { setLoading(false); }
    };
    fetchFeaturedProducts();
    const userId = getUserId();
    if (userId) { fetchWishlist(userId); fetchCart(userId); }
  }, []);

  const fetchWishlist = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/${userId}`);
      const data = await response.json();
      if (response.ok) setWishlist(Array.isArray(data) ? data.map(item => item.id) : []);
    } catch {}
  };

  const handleToggleWishlist = async (productId) => {
    const userId = getUserId();
    if (!userId) { setShowLoginPopup(true); return; }
    try {
      const response = await fetch(`${API_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
      const data = await response.json();
      if (response.ok) setWishlist(prev => data.liked ? [...prev, productId] : prev.filter(id => id !== productId));
    } catch {}
  };

  const handleAddToCart = async (product) => {
    const userId = getUserId();
    if (!userId) { setShowLoginPopup(true); return; }
    try {
      setAddingProductId(product.id);
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: product.id, quantity: 1 }),
      });
      if (response.ok) {
        setCartMap(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch { alert("Unable to add to cart"); } finally { setAddingProductId(null); }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    const userId = getUserId();
    if (!userId) return;
    if (newQty < 1) {
      try {
        const response = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        if (response.ok) {
          const newMap = { ...cartMap }; delete newMap[productId]; setCartMap(newMap);
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } catch {}
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, quantity: newQty }),
      });
      if (response.ok) {
        setCartMap(prev => ({ ...prev, [productId]: newQty }));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch {}
  };

  if (loading) return <section className="featured-section"><p>Loading sacred products...</p></section>;

  return (
    <section className="featured-section">
      <div className="featured-container">
        <div className="featured-heading">
          <p>HANDPICKED COLLECTIONS</p>
          <h2>Featured this week</h2>
        </div>

        <div className="featured-grid">
          {products.map((product) => {
            const qty = cartMap[product.id] || 0;
            return (
              <div className="walmart-card" key={product.id}>
                <div className="card-image-wrap">
                  <img src={product.image.startsWith("http") ? product.image : `${API_URL}${product.image}`} alt={product.name} />
                  <button className={`wish-btn ${wishlist.includes(product.id) ? 'active' : ''}`} onClick={() => handleToggleWishlist(product.id)}>
                    {wishlist.includes(product.id) ? '❤️' : '🤍'}
                  </button>
                </div>

                <div className="card-add-area">
                  {qty === 0 ? (
                    <button className="add-btn-expandable" onClick={() => handleAddToCart(product)} disabled={addingProductId === product.id}>
                      {addingProductId === product.id ? '...' : '+ Add'}
                    </button>
                  ) : (
                    <div className="qty-selector-pill">
                      <button onClick={() => handleUpdateQuantity(product.id, qty - 1)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => handleUpdateQuantity(product.id, qty + 1)}>+</button>
                    </div>
                  )}
                </div>

                <div className="card-details">
                  <span className="sponsored-tag">{product.brand || "Sacred Item"} ⓘ</span>
                  <div className="card-price-row">
                    <span className="price-now">₹{Number(product.price).toLocaleString("en-IN")}</span>
                  </div>
                  <h4 className="card-name">{product.name}</h4>
                  <div className="card-rating">
                    <span className="stars">★★★★☆</span>
                    <span className="count">12</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showLoginPopup && <LoginPopup onClose={() => setShowLoginPopup(false)} />}
    </section>
  );
};

export default Featured;
