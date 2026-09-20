import React, { useEffect, useRef, useState, useMemo } from "react";
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
  const [addingProductId, setAddingProductId] = useState(null);
  const [isSummarySticky, setIsSummarySticky] = useState(true);
  const cartLayoutRef = useRef(null);
  
  const [savedLaterItems, setSavedLaterItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("devaloka_saved_for_later") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  });

  const [isSavedExpanded, setIsSavedExpanded] = useState(true);
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
      setLoading(true);
      const response = await fetch(`${API_URL}/api/cart?user_id=${userId}`, {
        headers: { ...bypassHeaders }
      });
      const data = await response.json();
      if (response.ok) {
        setItems(Array.isArray(data.cart) ? data.cart : []);
      }
    } catch (requestError) {
      console.error("Fetch cart error", requestError);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatured = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/featured`);
      const data = await response.json();
      if (response.ok) {
        setFeaturedProducts(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    const handleSummaryStickiness = () => {
      if (!cartLayoutRef.current) return;
      const layoutBottom = cartLayoutRef.current.offsetTop + cartLayoutRef.current.offsetHeight - 180;
      setIsSummarySticky(window.scrollY < layoutBottom);
    };
    window.addEventListener("scroll", handleSummaryStickiness);
    window.addEventListener("resize", handleSummaryStickiness);
    return () => {
      window.removeEventListener("scroll", handleSummaryStickiness);
      window.removeEventListener("resize", handleSummaryStickiness);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("devaloka_saved_for_later", JSON.stringify(savedLaterItems));
  }, [savedLaterItems]);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return removeItem(productId);
    try {
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, quantity }),
      });
      if (response.ok) { fetchCart(); window.dispatchEvent(new Event("cartUpdated")); }
    } catch (e) {}
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

  const handleAddToCart = async (product) => {
    if (!userId) { navigate("/login"); return; }
    try {
      setAddingProductId(product.id);
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: product.id, quantity: 1 }),
      });
      if (response.ok) { fetchCart(); window.dispatchEvent(new Event("cartUpdated")); }
    } catch (error) { alert("Unable to add to cart"); }
    finally { setAddingProductId(null); }
  };

  const handleSaveForLater = (item) => {
    setSavedLaterItems(prev => {
      if (prev.some(i => i.product_id === item.product_id)) return prev;
      return [...prev, item];
    });
    removeItem(item.product_id);
  };

  const handleMoveToCart = async (item) => {
    if (!userId) { navigate("/login"); return; }
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: item.product_id, quantity: item.quantity || 1 }),
      });
      if (response.ok) {
        setSavedLaterItems(prev => prev.filter(i => i.product_id !== item.product_id));
        fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) { console.error(error); }
  };

  const removeSavedItem = (productId) => {
    setSavedLaterItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const totalItems = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const subtotal = items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
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

        <div ref={cartLayoutRef} className="cart-layout-walmart">
          {/* LEFT COLUMN */}
          <div className="cart-left-col">

            {/* 1. CART ITEMS OR EMPTY MESSAGE */}
            {items.length === 0 && !loading ? (
              <div className="cart-empty-walmart">
                 <div className="cart-empty-illustration">
  <div className="empty-cart-icon">🛒</div>
</div>
                 <div className="empty-cart-text">
                    <h2>Time to start shopping!</h2>
                    <p className="empty-personalized">Hi, {user?.name?.split(' ')[0] || 'Friend'} - fill it up with savings from your usual departments.</p>
                 </div>
                 <div className="empty-cart-actions">
                   <button className="dept-btn" onClick={() => navigate("/shop?category=Essentials")}>Shop Grocery</button>
                   <button className="dept-btn" onClick={() => navigate("/shop?category=Incense")}>Shop Electronics</button>
                   <button className="dept-btn" onClick={() => navigate("/shop?category=Idols%20%26%20Murtis")}>Shop Toys</button>
                   <button className="dept-btn" onClick={() => navigate("/shop")}>Shop Home</button>
                 </div>
              </div>
            ) : (
              <div className="cart-main-section">
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
                          <div className="item-img"><img src={imageUrl(item.image)} alt="" /></div>
                          <div className="item-info">
                             <div className="item-price-row"><span className="item-price">₹{Number(item.price).toLocaleString("en-IN")}</span></div>
                             <h4 className="item-name">{item.name}</h4>
                             <span className="returns-tag">↺ Free 31-day returns</span>
                             <div className="item-actions-row">
                                <div className="item-links">
                                  <button onClick={() => removeItem(item.product_id)}>Remove</button>
                                  <span className="v-sep">|</span>
                                  <button onClick={() => handleSaveForLater(item)}>Save for later</button>
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
            )}

            {/* 2. DISCOVER BRANDS */}
            <section className="cart-recommendations">
               <div className="rec-header"><h2>Discover Great Brands</h2></div>
               <div className="rec-grid">
                  {featuredProducts.slice(10, 20).map(p => {
                    const qty = cartMap[p.id] || 0;
                    const isAdding = addingProductId === p.id;
                    return (
                      <div key={p.id} className="walmart-card">
                        <div className="card-image-wrap"><img src={imageUrl(p.image)} alt="" /><button className="wish-btn">🤍</button></div>
                        <div className="card-add-area">
                          {qty === 0 ? (
                            <button
                              className="add-btn-expandable"
                              onClick={() => handleAddToCart(p)}
                              disabled={isAdding}
                            >
                              {isAdding ? "Adding..." : "+ Add"}
                            </button>
                          ) : (
                            <div className="qty-selector-pill"><button onClick={() => updateQuantity(p.id, qty - 1)}>−</button><span>{qty}</span><button onClick={() => updateQuantity(p.id, qty + 1)}>+</button></div>
                          )}
                        </div>
                        <div className="card-details">
                          <span className="sponsored-tag">Sponsored ⓘ</span>
                          <div className="card-price-row"><span className="price-now">₹{Number(p.price).toLocaleString("en-IN")}</span></div>
                          <h4 className="card-name">{p.name}</h4>
                          <div className="card-rating"><span className="stars">★★★★☆</span><span className="count">8</span></div>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </section>

            {/* 3. POPULAR ITEMS */}
            <section className="cart-recommendations">
               <div className="rec-header"><h2>Popular items in your area</h2><Link to="/shop" className="view-all-link">View all</Link></div>
               <div className="rec-grid">
                  {featuredProducts.slice(0, 10).map(p => {
                    const qty = cartMap[p.id] || 0;
                    return (
                      <div key={p.id} className="walmart-card">
                        <div className="card-image-wrap"><img src={imageUrl(p.image)} alt="" /><button className="wish-btn">🤍</button></div>
                        <div className="card-add-area">
                          {qty === 0 ? <button className="add-btn-expandable" onClick={() => handleAddToCart(p)}>+ Add</button> :
                          <div className="qty-selector-pill"><button onClick={() => updateQuantity(p.id, qty - 1)}>−</button><span>{qty}</span><button onClick={() => updateQuantity(p.id, qty + 1)}>+</button></div>}
                        </div>
                        <div className="card-details">
                          <span className="sponsored-tag">Sponsored ⓘ</span>
                          <div className="card-price-row"><span className="price-now">₹{Number(p.price).toLocaleString("en-IN")}</span></div>
                          <h4 className="card-name">{p.name}</h4>
                          <div className="card-rating"><span className="stars">★★★★☆</span><span className="count">12</span></div>
                          <p className="shipping-info">Shipping, arrives <strong>Soon</strong></p>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </section>

            {/* 4. SAVED FOR LATER */}
            <section className="saved-later-section">
               <div
                 className="saved-header"
                 onClick={() => setIsSavedExpanded(prev => !prev)}
                 onKeyDown={(e) => {
                   if (e.key === "Enter" || e.key === " ") {
                     e.preventDefault();
                     setIsSavedExpanded(prev => !prev);
                   }
                 }}
                 role="button"
                 tabIndex={0}
               >
                 <h3>Saved for later</h3>
                 <div className="saved-header-actions">
                   <span className="saved-count-pill">{savedLaterItems.length} items</span>
                   <span className="saved-toggle">{isSavedExpanded ? "−" : "+"}</span>
                 </div>
               </div>

               {isSavedExpanded && (
                 <div className="saved-content">
                    {savedLaterItems.length === 0 ? (
                      <div className="saved-empty"><p>You haven't saved any items for later yet.</p></div>
                    ) : (
                      <div className="saved-list">
                         {savedLaterItems.map(item => (
                           <div className="saved-item-card" key={item.product_id}>
                              <div className="s-img-wrap"><img src={imageUrl(item.image)} alt="" /></div>
                              <div className="s-item-details">
                                 <button className="move-to-cart-btn" onClick={() => handleMoveToCart(item)}>Move to cart</button>
                                 <div className="s-item-price">₹{Number(item.price).toLocaleString("en-IN")}</div>
                                 <h4 className="s-item-name">{item.name}</h4>
                                 <p className="s-item-qty">Qty: {item.quantity}</p>
                                 <button className="s-item-remove" onClick={() => removeSavedItem(item.product_id)}>Remove</button>
                              </div>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>
               )}
            </section>
          </div>

          {/* RIGHT FIXED COLUMN */}
          <aside className={`cart-right-col ${isSummarySticky ? "is-sticky" : ""}`}>
            <div className="cart-summary-card">
               <button className="walmart-checkout-btn" onClick={() => navigate("/checkout")} disabled={items.length === 0}>Continue to checkout</button>
               <p className="checkout-note">For the best shopping experience, <Link to="/login">sign in</Link></p>
               <div className="summary-rows">
                  <div className="s-row"><span>Subtotal ({totalItems} items)</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                  <div className="s-row"><span>Shipping</span><span className="free-text">Free</span></div>
                  <div className="s-row"><span>Taxes</span><span className="calc-text">Calculated at checkout</span></div>
               </div>
               <div className="summary-total-row"><strong>Estimated total</strong><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;
