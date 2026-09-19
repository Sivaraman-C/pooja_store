  import React, { useEffect, useState, useMemo } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import "./Cart.css";
  import API_URL, { bypassHeaders } from "../apiConfig";
  
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch (error) {
      return null;
    }
  };
  
  const Cart = () => {
    const [items, setItems] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addingProductId, setAddingProductId] = useState(null);
    const navigate = useNavigate();
  
    const user = getUser();
    const userId = user?.id || user?.user_id;
  
    const cartMap = useMemo(() => {
      const mapping = {};
      items.forEach(item => { mapping[item.product_id] = item.quantity; });
      return mapping;
    }, [items]);
  
    const fetchCart = async () => {
      if (!userId) { setLoading(false); return; }
      try {
        const response = await fetch(`${API_URL}/api/cart?user_id=${userId}`, {
          headers: { ...bypassHeaders }
        });
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Unable to load cart");
        }
  
        setItems(Array.isArray(data.cart) ? data.cart : []);
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Unable to load cart");
      } finally {
        setLoading(false);
      }
    };
  
    const fetchFeatured = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/featured`);
        const data = await response.json();
        if (response.ok) {
          setFeaturedProducts(Array.isArray(data) ? data.slice(0, 10) : []);
        }
      } catch (e) {
        console.error("Featured fetch error", e);
      }
    };
  
    useEffect(() => {
      fetchCart();
      fetchFeatured();
      window.addEventListener("cartUpdated", fetchCart);
      return () => window.removeEventListener("cartUpdated", fetchCart);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);
  
    const updateQuantity = async (productId, quantity) => {
      if (quantity < 1) return removeItem(productId);
  
      try {
        const response = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, quantity }),
        });
  
        if (response.ok) {
          setItems(prev => prev.map(item => item.product_id === productId ? { ...item, quantity } : item));
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } catch (e) {}
    };
  
    const handleAddToCart = async (product) => {
      if (!userId) { navigate("/login"); return; }
      try {
        setAddingProductId(product.id);
        const response = await fetch(`${API_URL}/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, product_id: product.id, quantity: 1 }),
        });
        if (response.ok) {
          fetchCart();
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } catch (error) {
        alert("Unable to add product to cart");
      } finally {
        setAddingProductId(null);
      }
    };
  
    const removeItem = async (productId) => {
      try {
        const response = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
  
        if (response.ok) {
          setItems(prev => prev.filter(item => item.product_id !== productId));
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } catch (e) {}
    };
  
    const totalItems = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
    const subtotal = items.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  
    const imageUrl = (image) => image?.startsWith("http") ? image : `${API_URL}${image || ""}`;
  
    if (!userId) {
      return (
        <main className="cart-page-walmart cart-empty-msg">
          <div className="cart-msg-box">
            <h1>Sign in to see your cart</h1>
            <button className="walmart-primary-btn" onClick={() => navigate("/login")}>Sign in</button>
          </div>
        </main>
      );
    }
  
    return (
      <main className="cart-page-walmart">
        <div className="cart-web-container">
          <h1 className="cart-main-title">Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})</h1>
  
          {items.length === 0 && !loading ? (
            <div className="cart-empty-walmart">
               <h2>Your cart is empty</h2>
               <p>Check out our featured collections!</p>
               <button className="walmart-primary-btn" onClick={() => navigate("/shop")}>Shop Now</button>
            </div>
          ) : (
            <div className="cart-layout-walmart">
              {/* LEFT COLUMN */}
              <div className="cart-left-col">
                <div className="cart-delivery-header">
                  <div className="delivery-icon-box">📱</div>
                  <h3>Pickup and delivery options</h3>
                  <span className="arrow-down">▼</span>
                </div>
  
                <div className="cart-shipping-group">
                  <div className="shipping-banner">
                    <div className="truck-icon">🚚</div>
                    <div className="shipping-text">
                      <h4>Free shipping, arrives by tomorrow</h4>
                      <p className="zip-link">Deliver to {user?.city || 'Your Area'}</p>
                    </div>
                  </div>
  
                  <div className="cart-items-list">
                    {items.map((item) => (
                      <div className="walmart-cart-item" key={item.product_id}>
                        <div className="item-main-row">
                          <div className="item-img">
                            <img src={imageUrl(item.image)} alt={item.name} />
                          </div>
                          <div className="item-info">
                             <div className="item-price-row">
                                <span className="item-price">₹{Number(item.price).toLocaleString("en-IN")}</span>
                             </div>
                             <h4 className="item-name">{item.name}</h4>
                             <span className="returns-tag">↺ Free 31-day returns</span>
  
                             <div className="item-actions-row">
                                <div className="item-links">
                                  <button onClick={() => removeItem(item.product_id)}>Remove</button>
                                  <span className="v-sep">|</span>
                                  <button>Save for later</button>
                                </div>
                                <div className="item-qty-pill">
                                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>−</button>
                                  <span>{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
  
              {/* RIGHT COLUMN */}
              <aside className="cart-right-col">
                <div className="cart-summary-card">
                   <button className="walmart-checkout-btn" onClick={() => navigate("/checkout")}>
                     Continue to checkout
                   </button>
                   <p className="checkout-note">For the best shopping experience, <Link to="/login">sign in</Link></p>
  
                   <div className="summary-rows">
                      <div className="s-row">
                        <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                        <span>₹{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="s-row">
                        <span>Shipping</span>
                        <span className="free-text">Free</span>
                      </div>
                      <div className="s-row">
                        <span>Taxes</span>
                        <span className="calc-text">Calculated at checkout</span>
                      </div>
                   </div>
  
                   <div className="summary-total-row">
                      <strong>Estimated total</strong>
                      <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                   </div>
                </div>
              </aside>
            </div>
          )}
  
          {/* BOTTOM: RECOMMENDATIONS (Single Row Scrollable) */}
          <section className="cart-recommendations">
             <div className="rec-header">
                <h2>Popular items in your area</h2>
                <Link to="/shop" className="view-all-link">View all</Link>
             </div>
             <div className="rec-grid">
                {featuredProducts.map(p => {
                  const qty = cartMap[p.id] || 0;
                  return (
                    <div key={p.id} className="walmart-card">
                      <div className="card-image-wrap">
                        <img src={imageUrl(p.image)} alt={p.name} />
                        <button className="wish-btn">🤍</button>
                      </div>
  
                      <div className="card-add-area">
                        {qty === 0 ? (
                          <button
                            className="add-btn-expandable"
                            onClick={() => handleAddToCart(p)}
                            disabled={addingProductId === p.id}
                          >
                            {addingProductId === p.id ? '...' : '+ Add'}
                          </button>
                        ) : (
                          <div className="qty-selector-pill">
                            <button onClick={() => updateQuantity(p.id, qty - 1)}>−</button>
                            <span>{qty}</span>
                            <button onClick={() => updateQuantity(p.id, qty + 1)}>+</button>
                          </div>
                        )}
                      </div>
  
                      <div className="card-details">
                        <span className="sponsored-tag">Sponsored ⓘ</span>
                        <div className="card-price-row">
                          <span className="price-now">₹{Number(p.price).toLocaleString("en-IN")}</span>
                        </div>
                        <h4 className="card-name">{p.name}</h4>
                        <div className="card-rating">
                          <span className="stars">★★★★☆</span>
                          <span className="count">12</span>
                        </div>
                        <p className="shipping-info">Shipping, arrives <strong>Soon</strong></p>
                      </div>
                    </div>
                  );
                })}
             </div>
          </section>
        </div>
      </main>
    );
  };
  
  export default Cart;