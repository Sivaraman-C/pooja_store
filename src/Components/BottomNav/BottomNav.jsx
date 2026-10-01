// import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./BottomNav.css";

const BottomNav = () => {
  const location = useLocation();

  const allNavItems = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Shop", path: "/shop", icon: "🛍️" },
    { name: "Wishlist", path: "/wishlist", icon: "🖤" },
    { name: "Calendar", path: "/calendar", icon: "📅" },
    { name: "You", path: "/profile", icon: "👤" },
  ];

  const activeIndex = allNavItems.findIndex(item => item.path === location.pathname);
  const selectedIndex = activeIndex !== -1 ? activeIndex : 0;

  const otherItems = allNavItems.filter((_, idx) => idx !== selectedIndex);
  const activeItem = allNavItems[selectedIndex];

  const reorderedItems = [
    otherItems[0],
    otherItems[1],
    activeItem,
    otherItems[2],
    otherItems[3],
  ];

  return (
    <nav className="mobile-bottom-nav">
      {reorderedItems.map((item, index) => {
        const isCenter = index === 2;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`bottom-nav-item ${isCenter ? "center-elevated-item" : ""}`}
          >
            {isCenter ? (
              <div className="center-floating-btn">
                <span className="bottom-nav-icon">
                  {item.name === "Home" ? (
                    <img src="/home_icon.svg" alt="Home" className="nav-svg-icon" />
                  ) : item.name === "You" ? (
                    <img src="/profile.svg" alt="Profile" className="nav-svg-icon" />
                  ) : item.name === "Shop" ? (
                    <img src="/shop.png" alt="Shop" className="nav-svg-icon" />
                  ) : item.name === "Calendar" ? (
                    <img src="/calendar.png" alt="Calendar" className="nav-svg-icon" />
                  ) : item.name === "Wishlist" ? (
                    <span className="bottom-nav-emoji">🖤</span>
                  ) : (
                    item.icon
                  )}
                </span>
              </div>
            ) : (
              <>
                <span className="bottom-nav-icon">
                  {item.name === "Home" ? (
                    <img src="/home_icon.svg" alt="Home" className="nav-svg-icon" />
                  ) : item.name === "You" ? (
                    <img src="/profile.svg" alt="Profile" className="nav-svg-icon" />
                  ) : item.name === "Shop" ? (
                    <img src="/shop.png" alt="Shop" className="nav-svg-icon" />
                  ) : item.name === "Calendar" ? (
                    <img src="/calendar.png" alt="Calendar" className="nav-svg-icon" />
                  ) : item.name === "Wishlist" ? (
                    <span className="bottom-nav-emoji">🖤</span>
                  ) : (
                    item.icon
                  )}
                </span>
                <span className="bottom-nav-text">{item.name}</span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
