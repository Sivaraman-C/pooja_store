import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Cart.css";

import API_URL from "../apiConfig";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch (error) {
    return null;
  }
};

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getUser();
  const userId = user?.id || user?.user_id;

  const fetchCart = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/cart?user_id=${userId}`);
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

  useEffect(() => {
    fetchCart();
    // The page refreshes when another component adds an item.
    window.addEventListener("cartUpdated", fetchCart);

    return () => window.removeEventListener("cartUpdated", fetchCart);
    // fetchCart is intentionally used as the event listener for this user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return removeItem(productId);
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, quantity }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to update quantity");
      }

      setItems((currentItems) => currentItems.map((item) => (
        item.product_id === productId ? { ...item, quantity } : item
      )));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (requestError) {
      setError(requestError.message || "Unable to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to remove item");
      }

      setItems((currentItems) => currentItems.filter(
        (item) => item.product_id !== productId
      ));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (requestError) {
      setError(requestError.message || "Unable to remove item");
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to clear cart");
      }

      setItems([]);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (requestError) {
      setError(requestError.message || "Unable to clear cart");
    }
  };

  const totalItems = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const subtotal = items.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const imageUrl = (image) => image?.startsWith("http") ? image : `${API_URL}${image || ""}`;

  if (!userId) {
    return (
      <main className="cart-page cart-message-page">
        <div className="cart-message">
          <p className="cart-eyebrow">YOUR BAG</p>
          <h1>Sign in to see your cart</h1>
          <Link className="cart-primary-button" to="/login">Sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <div>
            <p className="cart-eyebrow">YOUR BAG</p>
            <h1>Shopping cart</h1>
          </div>
          {items.length > 0 && (
            <button className="cart-clear-button" onClick={clearCart}>Clear cart</button>
          )}
        </div>

        {error && <p className="cart-error">{error}</p>}

        {loading ? (
          <p className="cart-status">Loading your cart...</p>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p>Find something meaningful for your space.</p>
            <Link className="cart-primary-button" to="/shop">Continue shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items" aria-label="Cart items">
              {items.map((item) => (
                <article className="cart-item" key={item.product_id}>
                  <img src={imageUrl(item.image)} alt={item.name} />
                  <div className="cart-item-details">
                    <h2>{item.name}</h2>
                    <p>₹{Number(item.price || 0).toLocaleString("en-IN")}</p>
                    <div className="cart-item-actions">
                      <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                        <button onClick={() => updateQuantity(item.product_id, Number(item.quantity) - 1)} aria-label={`Decrease ${item.name}`}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, Number(item.quantity) + 1)} aria-label={`Increase ${item.name}`}>+</button>
                      </div>
                      <button className="remove-button" onClick={() => removeItem(item.product_id)}>Remove</button>
                    </div>
                  </div>
                  <strong>₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}</strong>
                </article>
              ))}
            </section>

            <aside className="cart-summary">
              <h2>Order summary</h2>
              <div><span>Items</span><span>{totalItems}</span></div>
              <div className="summary-total"><span>Subtotal</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div>
              <Link className="cart-primary-button" to="/checkout">Proceed to checkout</Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;