import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPopup.css";

const LoginPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const goToLogin = () => {
    onClose();
    navigate("/login");
  };

  return (
    <div className="login-popup-overlay" onClick={onClose}>
      <div
        className="login-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="login-popup-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="login-popup-icon">
          🛒
        </div>

        <h2>Login Required</h2>

        <p>
          Please login to your Devaloka account
          before adding products to your cart.
        </p>

        <button
          className="login-popup-button"
          onClick={goToLogin}
        >
          Login to Continue
        </button>

        <button
          className="login-popup-cancel"
          onClick={onClose}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;