import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();
  const [showSignedInMessage, setShowSignedInMessage] = useState(false);

  const handleSignIn = () => {
    if (localStorage.getItem("user")) {
      setShowSignedInMessage(true);
      return;
    }

    navigate("/login");
  };

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Pooja Store
          </Link>
          <p>
            Thoughtfully selected essentials for every prayer, ritual, and
            meaningful moment.
          </p>
        </div>

        <div className="footer-column">
          <h2>Explore</h2>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-column">
          <h2>Account</h2>
          <Link to="/profile">My Profile</Link>
          <Link to="/cart">Shopping Cart</Link>
          <button className="footer-sign-in" onClick={handleSignIn}>
            Sign In
          </button>
        </div>

        <div className="footer-column footer-contact">
          <h2>Get In Touch</h2>
          <a href="mailto:hello@poojastore.com">hello@poojastore.com</a>
          <a href="tel:+919876543210">+91 98765 43210</a>
          <p>Mon-Sat, 9:00 AM-6:00 PM</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Pooja Store. All rights reserved.</p>
        <p>Made with care for your sacred spaces.</p>
      </div>

      {showSignedInMessage && (
        <div
          className="footer-popup-overlay"
          onClick={() => setShowSignedInMessage(false)}
        >
          <div
            className="footer-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="footer-popup-close"
              aria-label="Close message"
              onClick={() => setShowSignedInMessage(false)}
            >
              &times;
            </button>
            <h2 id="footer-popup-title">You are already signed in</h2>
            <p>Visit your profile to manage your account details.</p>
            <button
              className="footer-popup-button"
              onClick={() => {
                setShowSignedInMessage(false);
                navigate("/profile");
              }}
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
