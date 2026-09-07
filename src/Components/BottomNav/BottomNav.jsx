import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./BottomNav.css";
import API_URL from "../../apiConfig";

const BottomNav = () => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      setCartCount(0);
      return;
    }

    const userId = currentUser.id || currentUser.user_id;
    if (!userId) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/count?user_id=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setCartCount(Number(data.count || 0));
        console.log("Cart count updated:", data.count);
      }
    } catch (error) {
      console.error("BottomNav cart count error:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleUpdate);
    window.addEventListener("profileUpdated", handleUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleUpdate);
      window.removeEventListener("profileUpdated", handleUpdate);
    };
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "You", path: "/profile", icon: "👤" },
    { name: "Shop", path: "/shop", icon: "🛍️" },
    { name: "Calendar", path: "/calendar", icon: "📅" },
    { name: "Cart", path: "/cart", icon: "🛒" },
    { name: "Menu", path: "/menu", icon: "☰" },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`bottom-nav-item ${location.pathname === item.path ? "active" : ""}`}
        >
          <span className="bottom-nav-icon">
            {item.name === "Home" ? (
              <img src="/home_icon.svg" alt="Home" className="nav-svg-icon" />
            ) : item.name === "You" ? (
              <img src="/profile.svg" alt="Profile" className="nav-svg-icon" />
            ) : item.name === "Shop" ? (
              <img src="/shop.png" alt="Shop" className="nav-svg-icon" />
            ) : item.name === "Calendar" ? (
              <img src="/calendar.png" alt="Calendar" className="nav-svg-icon" />
            ) : item.name === "Cart" ? (
              <div className="cart-icon-wrapper">
                <img src="/cart.png" alt="Cart" className="nav-svg-icon" />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>
            ) : (
              item.icon
            )}
          </span>
          <span className="bottom-nav-text">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
