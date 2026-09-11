import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Profile.css";

import API_URL, { bypassHeaders } from "../../apiConfig";
import LogoutPopup from "../../Components/LogoutPopup/LogoutPopup";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") || "profile";
    const section = params.get("section");
    const editMode = params.get("edit") === "true";

    const nextTab = editMode ? "profile" : tab;
    setActiveTab(nextTab);

    if (editMode) {
      setEditing(true);
      return;
    }

    if (tab === "settings" && section) {
      setEditing(section === "edit-profile");
    }

    if (tab !== "settings") {
      setEditing(false);
    }
  }, [location.search]);

  // ==========================================
  // FETCH USER FROM DB
  // ==========================================
  useEffect(() => {
    const fetchProfile = async () => {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(savedUser);
      const userId = userData.id || userData.user_id;

      if (!userId) {
        setError("User session invalid. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching profile from: ${API_URL}/api/auth/profile/${userId}`);
        const response = await fetch(`${API_URL}/api/auth/profile/${userId}`, {
          headers: {
            "Accept": "application/json",
            ...bypassHeaders
          }
        });

        const data = await response.json();
        console.log("Profile Data received:", data);

        if (response.ok) {
          const fetchedUser = data.user;
          setUser(fetchedUser);
          setFormData({
            name: fetchedUser.name || "",
            email: fetchedUser.email || "",
            phone: fetchedUser.phone || "",
            address: fetchedUser.address || "",
            city: fetchedUser.city || "",
            state: fetchedUser.state || "",
            pincode: fetchedUser.pincode || "",
          });
          setImagePreview(fetchedUser.profile_image ? (fetchedUser.profile_image.startsWith("http") ? fetchedUser.profile_image : `${API_URL}${fetchedUser.profile_image}`) : "");

          // Sync local storage
          localStorage.setItem("user", JSON.stringify({
            ...userData,
            ...fetchedUser,
            profileImage: fetchedUser.profile_image
          }));
        } else {
          throw new Error(data.message || "Server error fetching profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(`Could not sync with server: ${err.message}`);
        // Fallback to local storage so the page isn't blank
        setUser(userData);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "pincode" && value.length === 6) {
      fetchLocation(value);
    }
  };

  const fetchLocation = async (pin) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await response.json();
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State
        }));
      }
    } catch (err) { console.error(err); }
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (!selectedImage) return;
    setProfileImage(selectedImage);
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const requestData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        requestData.append(key, value);
      });
      if (profileImage) {
        requestData.append("profileImage", profileImage);
      }

      const response = await fetch(`${API_URL}/api/auth/profile/${user.id}`, {
        method: "PUT",
        headers: { ...bypassHeaders },
        body: requestData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("profileUpdated"));
      setUser(updatedUser);
      setMessage("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id || activeTab !== "orders") return;

      setOrdersLoading(true);
      setOrdersError("");

      try {
        const response = await fetch(`${API_URL}/api/orders?user_id=${user.id}`, {
          headers: {
            "Accept": "application/json",
            ...bypassHeaders,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("My orders fetch error:", err);
        setOrders([]);
        setOrdersError("Unable to load your orders right now.");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, activeTab]);

  const fetchOrderDetails = async (orderId) => {
    if (!orderId) return;

    setOrderDetailsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/items`, {
        headers: {
          "Accept": "application/json",
          ...bypassHeaders,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrderDetails((prev) => ({ ...prev, [orderId]: Array.isArray(data) ? data : [] }));
      setExpandedOrderId(orderId);
    } catch (err) {
      console.error("Order details fetch error:", err);
      setOrderDetails((prev) => ({ ...prev, [orderId]: [] }));
      setExpandedOrderId(orderId);
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("profileUpdated"));
    navigate("/");
  };

  if (loading && !user) return <div className="profile-loading">Loading...</div>;

  const renderTabContent = () => {
    if (activeTab === "settings") {
      const params = new URLSearchParams(location.search);
      const section = params.get("section");

      return (
        <div className="profile-settings-panel">
          <div className="settings-card">
            {section === "language" && (
              <div className="settings-row">
                <label>Language</label>
                <select value={language} onChange={(e) => {
                  setLanguage(e.target.value);
                  localStorage.setItem("language", e.target.value);
                }}>
                  <option value="en">English</option>
                  <option value="ta">தமிழ்</option>
                  <option value="hi">हिन्दी</option>
                  <option value="te">తెలుగు</option>
                </select>
              </div>
            )}

            {section === "notifications" && (
              <div className="settings-row toggle-row">
                <label>Notifications</label>
                <label className="switch">
                  <input type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
            )}

            {section === "edit-profile" && (
              <div className="settings-actions only-edit">
                <button type="button" className="edit-profile-btn" onClick={() => {
                  setActiveTab("profile");
                  setEditing(true);
                  navigate("/profile?tab=profile");
                }}>Edit Profile</button>
              </div>
            )}

            {!section && (
              <>
                <div className="settings-row">
                  <label>Language</label>
                  <select value={language} onChange={(e) => {
                    setLanguage(e.target.value);
                    localStorage.setItem("language", e.target.value);
                  }}>
                    <option value="en">English</option>
                    <option value="ta">தமிழ்</option>
                    <option value="hi">हिन्दी</option>
                    <option value="te">తెలుగు</option>
                  </select>
                </div>

                <div className="settings-row toggle-row">
                  <label>Notifications</label>
                  <label className="switch">
                    <input type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="settings-actions">
                  <button type="button" className="edit-profile-btn" onClick={() => {
                    setActiveTab("profile");
                    setEditing(true);
                    navigate("/profile?tab=profile");
                  }}>Edit Profile</button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "orders") {
      if (ordersLoading) {
        return (
          <div className="profile-settings-panel">
            <div className="settings-card empty-state-card">
              <h3>My Orders</h3>
              <p>Loading your orders...</p>
            </div>
          </div>
        );
      }

      if (ordersError) {
        return (
          <div className="profile-settings-panel">
            <div className="settings-card empty-state-card">
              <h3>My Orders</h3>
              <p>{ordersError}</p>
            </div>
          </div>
        );
      }

      if (orders.length === 0) {
        return (
          <div className="profile-settings-panel">
            <div className="settings-card empty-state-card">
              <h3>My Orders</h3>
              <p>You have no recent orders yet.</p>
              <button type="button" className="edit-profile-btn" onClick={() => navigate("/shop")}>Continue Shopping</button>
            </div>
          </div>
        );
      }

      return (
        <div className="profile-settings-panel">
          <div className="settings-card">
            <h3>My Orders</h3>
            <div className="order-list">
              {orders.map((order) => {
                const details = orderDetails[order.id] || [];
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div key={order.id} className="order-item-card">
                    <div className="order-item-header">
                      <strong>Order #{order.id}</strong>
                      <span className="order-status-badge">{order.status || "Pending"}</span>
                    </div>
                    <div className="order-item-meta">
                      <span>{new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      <span>{order.payment_method || "Cash on delivery"}</span>
                    </div>
                    <div className="order-item-total">Total: ₹{Number(order.total || 0).toLocaleString("en-IN")}</div>

                    <button
                      type="button"
                      className="view-details-btn"
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedOrderId(null);
                          return;
                        }
                        fetchOrderDetails(order.id);
                      }}
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                    </button>

                    {isExpanded && (
                      <div className="order-details-box">
                        {orderDetailsLoading && expandedOrderId === order.id ? (
                          <p>Loading order items...</p>
                        ) : details.length === 0 ? (
                          <p>No items found for this order.</p>
                        ) : (
                          <ul className="order-details-list">
                            {details.map((item) => (
                              <li key={item.id} className="order-detail-item">
                                <span>{item.product_name}</span>
                                <span>Qty: {item.quantity}</span>
                                <span>₹{Number(item.price || 0).toLocaleString("en-IN")}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "help") {
      return (
        <div className="profile-settings-panel">
          <div className="settings-card empty-state-card">
            <h3>Help Center</h3>
            <p>Need support? Contact our team at support@devaloka.com or visit the contact page.</p>
            <button type="button" className="edit-profile-btn" onClick={() => navigate("/contact")}>Contact Us</button>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {imagePreview ? <img src={imagePreview} alt="Profile" /> : (user?.name ? user.name.charAt(0).toUpperCase() : "U")}
          </div>
          {editing && (
            <label className="profile-image-label">
              Change Photo
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div className="profile-user">
          <h2>{user?.name}</h2>
          <span>{user?.email}</span>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-field">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="profile-field">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="profile-field">
            <label>Phone Number</label>
            <input type="text" name="phone" value={formData.phone} disabled={true} style={{background:'#f5f5f5'}} />
          </div>
          <div className="profile-field">
            <label>Pincode</label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="profile-field">
            <label>City</label>
            <input type="text" name="city" value={formData.city} readOnly style={{background:'#f5f5f5'}} />
          </div>
          <div className="profile-field">
            <label>State</label>
            <input type="text" name="state" value={formData.state} readOnly style={{background:'#f5f5f5'}} />
          </div>
          <div className="profile-field full">
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} disabled={!editing} rows="3" />
          </div>

          {editing && (
            <div className="profile-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    address: user.address || "",
                    city: user.city || "",
                    state: user.state || "",
                    pincode: user.pincode || "",
                  });
                  setImagePreview(user.profile_image ? (user.profile_image.startsWith("http") ? user.profile_image : `${API_URL}${user.profile_image}`) : "");
                  setProfileImage(null);
                  setError("");
                  setMessage("");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="save-profile-btn" disabled={loading}>Save Changes</button>
            </div>
          )}
        </form>

        {!editing && (
          <div className="profile-footer-actions">
            <button className="logout-profile-btn" onClick={() => setShowLogoutPopup(true)}>Logout</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-title">
          <div>
            <p>MY ACCOUNT</p>
            <h1>{activeTab === "profile" ? "My Profile" : activeTab === "settings" ? "Settings" : activeTab === "orders" ? "My Orders" : "Help Center"}</h1>
          </div>
          {activeTab === "profile" && !editing && (
            <button className="edit-profile-btn" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>

        <div className="profile-tab-row">
          <button type="button" className={activeTab === "profile" ? "profile-tab active" : "profile-tab"} onClick={() => { setActiveTab("profile"); navigate("/profile?tab=profile"); }}>Profile</button>
          <button type="button" className={activeTab === "orders" ? "profile-tab active" : "profile-tab"} onClick={() => { setActiveTab("orders"); navigate("/profile?tab=orders"); }}>My Orders</button>
          <button type="button" className={activeTab === "settings" ? "profile-tab active" : "profile-tab"} onClick={() => { setActiveTab("settings"); navigate("/profile?tab=settings"); }}>Settings</button>
          <button type="button" className={activeTab === "help" ? "profile-tab active" : "profile-tab"} onClick={() => { setActiveTab("help"); navigate("/profile?tab=help"); }}>Help Center</button>
        </div>

        {message && <div className="profile-success">{message}</div>}
        {error && <div className="profile-error">{error}</div>}

        {renderTabContent()}
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

export default Profile;
