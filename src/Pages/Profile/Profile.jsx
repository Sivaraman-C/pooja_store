import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

import API_URL, { bypassHeaders } from "../../apiConfig";
import LogoutPopup from "../../Components/LogoutPopup/LogoutPopup";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("profileUpdated"));
    navigate("/");
  };

  if (loading && !user) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-title">
          <div>
            <p>MY ACCOUNT</p>
            <h1>My Profile</h1>
          </div>
          {!editing && (
            <button className="edit-profile-btn" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>

        {message && <div className="profile-success">{message}</div>}
        {error && <div className="profile-error">{error}</div>}

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
                <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
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
