import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL, { bypassHeaders } from "../apiConfig";
import "./Wishlist.css";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showAll, setShowAll] = useState(false);

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

  const handleRemove = async (productId) => {
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
    if (!userId) return;

    setAddingToCart(product.id);
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          quantity: 1
        }),
      });

      if (response.ok) {
        window.dispatchEvent(new Event("cartUpdated"));
        alert(`${product.name} added to cart!`);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Error adding to cart");
    } finally {
      setAddingToCart(null);
    }
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

  const displayedItems = showAll ? items : items.slice(0, 9);

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
          <>
            <div className="wishlist-grid">
              {displayedItems.map(product => (
                <div key={product.id} className="wishlist-card">
                  <img src={getImageUrl(product.image)} alt={product.name} />
                  <div className="wishlist-info">
                    <h3>{product.name}</h3>
                    <p>₹{Number(product.price).toLocaleString("en-IN")}</p>
                    <div className="wishlist-actions">
                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart === product.id}
                      >
                        {addingToCart === product.id ? "..." : "Add"}
                      </button>
                      <button onClick={() => handleRemove(product.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 9 && (
              <div className="know-more-container">
                <button className="know-more-btn" onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Know Less ↵" : "Know More ➔"}
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
