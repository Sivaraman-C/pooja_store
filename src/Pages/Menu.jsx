import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Menu.css";
import LogoutPopup from "../Components/LogoutPopup/LogoutPopup";

const Menu = () => {
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("profileUpdated"));
    navigate("/");
  };

  return (
    <div className="mobile-menu-page">
      <h2>All Categories</h2>
      <div className="menu-grid">
        <Link to="/shop" className="menu-card">Shop All</Link>
        <Link to="/wishlist" className="menu-card">Liked Products</Link>
        <Link to="/about" className="menu-card">About Us</Link>
        <Link to="/contact" className="menu-card">Contact</Link>
        <Link to="/profile" className="menu-card">My Profile</Link>
        <Link to="/cart" className="menu-card">My Cart</Link>
        <div className="menu-card logout-card" onClick={() => setShowLogoutPopup(true)}>Logout</div>
      </div>

      {showLogoutPopup && (
        <LogoutPopup
          onCancel={() => setShowLogoutPopup(false)}
          onConfirm={() => {
            setShowLogoutPopup(false);
            handleLogout();
          }}
        />
      )}
    </div>
  );
};

export default Menu;
