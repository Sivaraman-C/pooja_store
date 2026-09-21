import React, { useEffect, useState, useRef } from "react";
import { Geolocation } from "@capacitor/geolocation";
import "./Navbar.css";
import API_URL, { bypassHeaders } from "../../apiConfig";

import Logo from "../Assets/Logo2.png";
import Cart from "../Assets/cart.png";
import { Link, useNavigate } from "react-router-dom";
import LogoutPopup from "../LogoutPopup/LogoutPopup";

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [showProfile, setShowProfile] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const profileRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  const [locationForm, setLocationForm] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);

  const navigate = useNavigate();

  const getProfileImageSrc = (userData) => {
    const image = userData?.profileImage || userData?.profile_image || userData?.profileImg || userData?.avatar;

    if (!image) return "";
    if (image.startsWith("http") || image.startsWith("data:")) return image;
    if (image.startsWith("/")) return `${API_URL}${image}`;
    return `${API_URL}/${image}`;
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchTerm.trim()) {
        navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      }
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported on this device.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const query = event.results[0][0].transcript;
      setSearchTerm(query);
      navigate(`/shop?search=${encodeURIComponent(query)}`);
    };
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const triggerCameraSearch = () => {
    alert("Camera search coming soon!");
  };

  useEffect(() => {
    const handleProfileUpdated = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener("profileUpdated", handleProfileUpdated);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current && !profileRef.current.contains(event.target) &&
        mobileProfileRef.current && !mobileProfileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchCartData = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      setCartCount(0);
      setCartTotal(0);
      return;
    }

    const userId = currentUser.id || currentUser.user_id;
    if (!userId) {
      setCartCount(0);
      setCartTotal(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart?user_id=${userId}`, {
        headers: { ...bypassHeaders }
      });
      const data = await response.json();
      if (response.ok && data.cart) {
        const cart = data.cart;
        const count = cart.reduce((acc, item) => acc + Number(item.quantity), 0);
        const total = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
        setCartCount(count);
        setCartTotal(total);
      }
    } catch (error) {
      console.error("Navbar cart data error:", error);
      setCartCount(0);
      setCartTotal(0);
    }
  };

  useEffect(() => {
    fetchCartData();
    const handleCartUpdated = () => fetchCartData();
    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => window.removeEventListener("cartUpdated", handleCartUpdated);
  }, []);

  const changeLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    localStorage.setItem("language", selectedLanguage);
    const googleSelect = document.querySelector(".goog-te-combo");
    if (googleSelect) {
      googleSelect.value = selectedLanguage;
      googleSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowProfile(false);
    navigate("/");
  };

  const openLocationModal = () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setLocationForm({
      address: currentUser.address || "",
      city: currentUser.city || "",
      state: currentUser.state || "",
      pincode: currentUser.pincode || "",
    });
    setShowLocationModal(true);
  };

  const handleLocationFormChange = (e) => {
    const { name, value } = e.target;
    setLocationForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "pincode" && value.length < 6 ? { city: "", state: "" } : {}),
    }));

    if (name === "pincode" && value.length === 6) {
      fetchPincodeLocation(value);
    }
  };

  const fetchPincodeLocation = async (pincode) => {
    setPincodeLoading(true);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      const postOffice = data[0]?.Status === "Success" ? data[0].PostOffice?.[0] : null;

      if (postOffice) {
        setLocationForm((prev) => ({
          ...prev,
          city: postOffice.District || "",
          state: postOffice.State || "",
        }));
      } else {
        setLocationForm((prev) => ({ ...prev, city: "", state: "" }));
      }
    } catch (error) {
      console.error("Pincode lookup error:", error);
    } finally {
      setPincodeLoading(false);
    }
  };

  const saveLocation = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!currentUser) return;

    setLocationSaving(true);

    try {
      let updatedUser = { ...currentUser, ...locationForm };

      if (currentUser.id || currentUser.user_id) {
        const requestData = new FormData();
        const userId = currentUser.id || currentUser.user_id;
        Object.entries({ ...currentUser, ...locationForm }).forEach(([key, value]) => {
          if (value !== null && value !== undefined && key !== "id" && key !== "user_id") {
            requestData.append(key, value);
          }
        });

        const response = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
          method: "PUT",
          headers: { ...bypassHeaders },
          body: requestData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not save delivery address");
        updatedUser = { ...currentUser, ...(data.user || locationForm) };
      }

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("profileUpdated"));
      setShowLocationModal(false);
    } catch (error) {
      console.error("Delivery address save error:", error);
      alert(error.message);
    } finally {
      setLocationSaving(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    const isNativeApp = !!window.Capacitor;

    setLocationLoading(true);

    try {
      let coords;

      if (isNativeApp) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted') {
          throw new Error('Location permission denied');
        }

        const result = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000,
        });
        coords = result.coords;
      } else if (navigator.geolocation) {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
          });
        }).then((position) => position.coords);
      } else {
        throw new Error('Geolocation is not supported on this browser.');
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
      );
      const data = await response.json();

      const address = data.address || {};
      setLocationForm((prev) => ({
        ...prev,
        address: address.road || prev.address || "Current Location",
        city: address.city || address.town || address.village || prev.city || "",
        state: address.state || prev.state || "",
        pincode: address.postcode || prev.pincode || "",
      }));
    } catch (error) {
      console.error("Geolocation error:", error);
      alert("Location access was denied. Please enable location permission or enter a pincode manually.");
    } finally {
      setLocationLoading(false);
    }
  };

  const deliveryPlace = user?.city || user?.state || user?.pincode;
  const displayLocationLabel = deliveryPlace ? `Deliver to ${deliveryPlace}` : "Select Location";

  const ProfileDropdown = () => (
    <div className="profile-dropdown-modern">
      <div className="profile-header-modern">
        <div className="profile-avatar-large">
           {getProfileImageSrc(user) ? (
              <img src={getProfileImageSrc(user)} alt="" />
           ) : (
              <span>👤</span>
           )}
        </div>
        <div className="profile-meta-modern">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </div>
      </div>
      <div className="profile-divider-modern"></div>
      <div className="profile-list-modern">
        <button type="button" onClick={() => { setShowProfile(false); navigate("/profile?tab=profile"); }}>Profile</button>
        <button type="button" onClick={() => { setShowProfile(false); navigate("/wishlist"); }}>My Wishlist</button>
        <button type="button" onClick={() => { setShowProfile(false); navigate("/profile?tab=orders"); }}>My Orders</button>

        <div className="profile-settings-wrapper-modern">
          <button
            type="button"
            className="settings-trigger-modern"
            onClick={() => setShowSettingsMenu((prev) => !prev)}
          >
            Settings
            <span className={`arrow-icon ${showSettingsMenu ? 'up' : ''}`}>▼</span>
          </button>
          {showSettingsMenu && (
            <div className="profile-inner-submenu">
              <button type="button" onClick={() => { setShowSettingsMenu(false); setShowProfile(false); navigate("/profile?tab=settings&section=notifications"); }}>Notifications</button>
              <button type="button" onClick={() => { setShowSettingsMenu(false); setShowProfile(false); navigate("/profile?tab=profile&edit=true"); }}>Edit Profile</button>
              <div className="language-selector-modern">
                <span>Language</span>
                <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
                  <option value="en">English</option>
                  <option value="ta">தமிழ்</option>
                  <option value="hi">हिन्दी</option>
                  <option value="te">తెలుగు</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <button type="button" onClick={() => { setShowProfile(false); navigate("/contact"); }}>Help Center</button>
        <div className="profile-divider-modern"></div>
        <button type="button" className="logout-btn-modern" onClick={() => setShowLogoutPopup(true)}>Logout</button>
      </div>
    </div>
  );

  return (
    <div className="navbar">
      {/* DESKTOP VIEW */}
      <div className="navbar-container desktop-navbar">
        <div className="nav-primary-row">
          <div className="nav-left-group">
            <Link to="/" className="nav-logo-link">
              <img src={Logo} alt="Logo" className="nav-logo-img" />
            </Link>
          </div>

          <div className="nav-center-group">
            <div className="nav-search-bar">
              <img
                src="/search.svg"
                alt="Search"
                className="nav-search-icon-img"
                onClick={handleSearch}
              />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
              <img
                src="/mic.png"
                alt="Voice"
                className={`nav-mic-icon-img ${isListening ? "listening" : ""}`}
                onClick={handleVoiceSearch}
              />
              <img
                src="/camera.svg"
                alt="Camera"
                className="nav-camera-icon-img"
                onClick={triggerCameraSearch}
              />
            </div>
          </div>

          <div className="nav-right-group">
            <Link to="/cart" className="cart-link-new">
              <div className="cart-icon-wrap">
                <img src={Cart} alt="Cart" />
                <span className="cart-badge-new">{cartCount}</span>
              </div>
              <div className="cart-info-wrap">
                <span className="cart-total-amt">₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="nav-secondary-row">
          <div className="nav-sec-left">
            <button type="button" className="nav-location" onClick={openLocationModal}>
              <span className="location-icon">📍</span>
              <span className="location-text">{displayLocationLabel}</span>
            </button>
          </div>

          <div className="nav-sec-center">
            <ul className="nav-menu-list">
              <li className={menu === "home" ? "active" : ""} onClick={() => setMenu("home")}><Link to="/">Home</Link></li>
              <li className={menu === "shop" ? "active" : ""} onClick={() => setMenu("shop")}><Link to="/shop">Shop</Link></li>
              <li className={menu === "calendar" ? "active" : ""} onClick={() => setMenu("calendar")}><Link to="/calendar">Calendar</Link></li>
              <li className={menu === "about" ? "active" : ""} onClick={() => setMenu("about")}><Link to="/about">About</Link></li>
              <li className={menu === "contact" ? "active" : ""} onClick={() => setMenu("contact")}><Link to="/contact">Contact</Link></li>
              {user && ["admin", "super_admin"].includes(user.role) && (
                <li className={menu === "dashboard" ? "active" : ""} onClick={() => setMenu("dashboard")}><Link to="/admin">Dashboard</Link></li>
              )}
            </ul>
          </div>

          <div className="nav-sec-right">
            <div className="nav-actions">
              <Link to="/wishlist" className="wishlist-link-row">❤️</Link>
              {user ? (
                <div className="profile-wrapper" ref={profileRef}>
                  <button className="profile-button-circle" onClick={() => setShowProfile(!showProfile)}>
                    {getProfileImageSrc(user) ? (
                      <img className="profile-nav-image" src={getProfileImageSrc(user)} alt="Profile" />
                    ) : (
                      <span className="profile-nav-placeholder-circle">👤</span>
                    )}
                  </button>
                  {showProfile && <ProfileDropdown />}
                </div>
              ) : (
                <Link to="/login" className="login-link">
                  <button className="login-btn-nav">Login</button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="mobile-navbar">
        <div className="mobile-top-bar">
          <div className="mobile-navbar-content">
            <div className="mobile-primary-row">
              <div className="mobile-left">
                <button className="mobile-hamburger" onClick={() => navigate("/menu")}>
                  <span></span><span></span><span></span>
                </button>
                <Link to="/" className="mobile-logo-link">
                  <img src={Logo} alt="Logo" className="mobile-logo-img" />
                </Link>
              </div>

              <div className="mobile-center">
                <div className="mobile-search-pill">
                  <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearch} />
                  <button className="mobile-search-go" onClick={handleSearch}><img src="/search.svg" alt="" /></button>
                </div>
              </div>

              <div className="mobile-right">
                <Link to="/cart" className="mobile-cart-new">
                  <div className="mobile-cart-icon-box">
                    <img src={Cart} alt="Cart" />
                    <span className="mobile-cart-count-new">{cartCount}</span>
                  </div>
                  <span className="mobile-cart-total-new">₹{cartTotal.toLocaleString("en-IN")}</span>
                </Link>
              </div>
            </div>

            <div className="mobile-bottom-row">
              <button type="button" className="mobile-location-pill" onClick={openLocationModal}>
                <span className="mobile-pin-icon">📍</span>
                <span className="mobile-location-text">{displayLocationLabel}</span>
              </button>

              <div className="mobile-user-actions">
                <Link to="/wishlist" className="mobile-action-link">❤️</Link>
                <div className="mobile-profile-wrapper" ref={mobileProfileRef}>
                  <button type="button" className="mobile-profile-trigger" onClick={() => setShowProfile(!showProfile)}>
                    {user && getProfileImageSrc(user) ? (
                      <img src={getProfileImageSrc(user)} alt="Profile" className="mobile-profile-img" />
                    ) : (
                      <span className="mobile-profile-placeholder">👤</span>
                    )}
                  </button>
                  {showProfile && user && <ProfileDropdown />}
                </div>
                {user && ["admin", "super_admin"].includes(user.role) && (<Link to="/admin" className="mobile-action-link">📊</Link>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLocationModal && (
        <div className="location-modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="location-modal-header">
              <h3>Current delivery address</h3>
              <button type="button" className="close-location-modal" onClick={() => setShowLocationModal(false)}>×</button>
            </div>
            <div className="location-modal-body">
              <div className="location-address-field">
                <label>Address</label>
                <textarea name="address" rows="3" value={locationForm.address} onChange={handleLocationFormChange} placeholder="House / Flat / Street" />
              </div>
              <div className="location-grid">
                <div className="location-field"><label>City</label><input type="text" name="city" value={locationForm.city} onChange={handleLocationFormChange} /></div>
                <div className="location-field"><label>State</label><input type="text" name="state" value={locationForm.state} onChange={handleLocationFormChange} /></div>
              </div>
              <div className="location-field"><label>Pincode</label><input type="text" name="pincode" inputMode="numeric" maxLength="6" value={locationForm.pincode} onChange={handleLocationFormChange} /></div>
              <div className="location-modal-actions">
                <button type="button" className="location-current-btn" onClick={handleUseCurrentLocation} disabled={locationLoading}>Use current location</button>
                <button type="button" className="location-save-btn" onClick={saveLocation} disabled={locationSaving || pincodeLoading}>Save address</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutPopup && (
        <LogoutPopup onCancel={() => setShowLogoutPopup(false)} onConfirm={() => { setShowLogoutPopup(false); handleLogout(); }} />
      )}
    </div>
  );
};

export default Navbar;
