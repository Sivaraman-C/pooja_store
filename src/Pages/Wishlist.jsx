import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../apiConfig";
import "./Wishlist.css";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?.user_id;

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/${userId}`);
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

  const handleRemove = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error("Remove from wishlist error:", error);
    }
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

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1>My Liked Products</h1>
        {items.length === 0 ? (
          <div className="wishlist-empty">
            <p>You haven't liked any products yet.</p>
            <Link to="/shop" className="wishlist-btn">Go Shopping</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map(product => (
              <div key={product.id} className="wishlist-card">
                <img src={`${API_URL}${product.image}`} alt={product.name} />
                <div className="wishlist-info">
                  <h3>{product.name}</h3>
                  <p>₹{Number(product.price).toLocaleString("en-IN")}</p>
                  <div className="wishlist-actions">
                    <Link to={`/shop?search=${encodeURIComponent(product.name)}`} className="view-btn">View</Link>
                    <button onClick={() => handleRemove(product.id)} className="remove-btn">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
