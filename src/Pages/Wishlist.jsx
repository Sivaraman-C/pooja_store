import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL, { bypassHeaders } from "../apiConfig";
import "./Wishlist.css";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [cartMap, setCartMap] = useState({}); // productId -> quantity
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?.user_id;

  const fetchCart = async (uId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart?user_id=${uId}`, {
        headers: { ...bypassHeaders }
      });
      const data = await response.json();
      if (response.ok && data.cart) {
        const mapping = {};
        data.cart.forEach(item => {
          mapping[item.product_id] = item.quantity;
        });
        setCartMap(mapping);
      }
    } catch (error) {
      console.error("Fetch cart error:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWishlist();
      fetchCart(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/${userId}`, {
        headers: { ...bypassHeaders }
      });
      const data = await response.json();
      if (response.ok) {
        setItems(data);
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({ userId, productId }),
      });
      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error("Remove from wishlist error:", error);
    }
  };

  const handleAddToCart = async (product) => {
    if (!userId) { navigate("/login"); return; }
    try {
      setAddingProductId(product.id);
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({ user_id: userId, product_id: product.id, quantity: 1 }),
      });
      if (response.ok) {
        setCartMap(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      alert("Unable to add product to cart");
    } finally {
      setAddingProductId(null);
    }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    if (!userId) return;

    if (newQty < 1) {
      try {
        const response = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...bypassHeaders },
          body: JSON.stringify({ user_id: userId }),
        });
        if (response.ok) {
          const newMap = { ...cartMap };
          delete newMap[productId];
          setCartMap(newMap);
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } catch {}
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({ user_id: userId, quantity: newQty }),
      });
      if (response.ok) {
        setCartMap(prev => ({ ...prev, [productId]: newQty }));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch {}
  };

  const getImageUrl = (image) => {
    if (!image) return "/logo.svg";
    return image.startsWith("http") ? image : `${API_URL}${image}`;
  };

  if (!userId) {
    return (
      <div className="wishlist-page empty">
        <h1>Please login to see your liked products</h1>
        <Link to="/login" className="wishlist-btn">Login</Link>
      </div>
    );
  }

  if (loading) return <div className="wishlist-page">Loading...</div>;

  const displayedItems = showAll ? items : items.slice(0, 12);

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1>My Liked Products ({items.length})</h1>
        {items.length === 0 ? (
          <div className="wishlist-empty">
            <p>You haven't liked any products yet.</p>
            <Link to="/shop" className="wishlist-btn">Go Shopping</Link>
          </div>
        ) : (
          <>
            <div className="wishlist-grid">
              {displayedItems.map(product => {
                const qty = cartMap[product.id] || 0;
                return (
                  <div key={product.id} className="walmart-card">
                    <div className="card-image-wrap">
                      <img src={getImageUrl(product.image)} alt={product.name} />
                      <button
                        className="wish-btn active"
                        onClick={() => handleToggleWishlist(product.id)}
                      >
                        ❤️
                      </button>
                    </div>

                    <div className="card-add-area">
                      {qty === 0 ? (
                        <button
                          className="add-btn-expandable"
                          onClick={() => handleAddToCart(product)}
                          disabled={addingProductId === product.id}
                        >
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
                      <p className="shipping-info">Shipping, arrives <strong>Soon</strong></p>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length > 12 && (
              <div className="know-more-container">
                <button className="know-more-btn" onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Know Less" : "Know More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
