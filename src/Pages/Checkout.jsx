import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Checkout.css";

import API_URL, { bypassHeaders } from "../apiConfig";

const Checkout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id || user?.user_id;
  const [form, setForm] = useState({
    customer_name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    payment_method: "Cash on delivery",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
          headers: { ...bypassHeaders },
        });
        const data = await response.json();
        if (!response.ok || !data.user) return;

        const profile = data.user;
        setForm((previousForm) => ({
          ...previousForm,
          customer_name: profile.name || previousForm.customer_name,
          email: profile.email || previousForm.email,
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
        }));
        const currentUser = JSON.parse(localStorage.getItem("user") || "null");
        localStorage.setItem("user", JSON.stringify({ ...currentUser, ...profile }));
      } catch (profileError) {
        console.error("Checkout profile fetch error:", profileError);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, user_id: userId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place order");
      }

      setOrder(data.order);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (requestError) {
      setError(requestError.message || "Unable to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <main className="checkout-page checkout-message-page">
        <div className="checkout-message">
          <h1>Sign in before checkout</h1>
          <Link className="checkout-button" to="/login">Sign in</Link>
        </div>
      </main>
    );
  }

  if (order) {
    return (
      <main className="checkout-page checkout-message-page">
        <div className="checkout-message">
          <p className="checkout-eyebrow">ORDER CONFIRMED</p>
          <h1>Thank you for your order.</h1>
          <p>Your order #{order.id} has been placed successfully.</p>
          <button className="checkout-button" onClick={() => navigate("/")}>Continue shopping</button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-heading">
          <p className="checkout-eyebrow">SECURE CHECKOUT</p>
          <h1>Complete your order</h1>
        </div>

        <form className="checkout-layout" onSubmit={placeOrder}>
          <section className="checkout-form-section">
            <h2>Delivery details</h2>
            <div className="checkout-fields">
              {[
                ["customer_name", "Full name", "text"],
                ["email", "Email address", "email"],
                ["phone", "Phone number", "tel"],
                ["address", "Street address", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["pincode", "PIN code", "text"],
              ].map(([name, label, type]) => (
                <label className={name === "address" ? "field-wide" : ""} key={name}>
                  {label}
                  <input name={name} type={type} value={form[name]} onChange={handleChange} required />
                </label>
              ))}
            </div>
            <h2>Payment method</h2>
            <label className="payment-option">
              <input type="radio" name="payment_method" value="Cash on delivery" checked={form.payment_method === "Cash on delivery"} onChange={handleChange} />
              Cash on delivery
            </label>
            <label className="payment-option">
              <input type="radio" name="payment_method" value="Online payment" checked={form.payment_method === "Online payment"} onChange={handleChange} />
              Online payment <span>(payment gateway coming soon)</span>
            </label>
          </section>

          <aside className="checkout-summary">
            <h2>Ready to place it?</h2>
            <p>Your cart items will be reserved and sent to the address above.</p>
            {error && <div className="checkout-error">{error}</div>}
            <button className="checkout-button" type="submit" disabled={submitting}>
              {submitting ? "Placing order..." : "Place order"}
            </button>
            <Link className="back-to-cart" to="/cart">Back to cart</Link>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default Checkout;