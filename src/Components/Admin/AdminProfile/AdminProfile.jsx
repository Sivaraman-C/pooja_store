import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../Pages/Profile/Profile.css";

import API_URL from "../../../apiConfig";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
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
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(savedUser);

    if (!userData || !["admin", "super_admin"].includes(userData.role)) {
      navigate("/login");
      return;
    }

    setUser(userData);
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      address: userData.address || "",
      city: userData.city || "",
      state: userData.state || "",
      pincode: userData.pincode || "",
    });
    setImagePreview(userData.profileImage ? `${API_URL}${userData.profileImage}` : "");
  }, [navigate]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];

    if (!selectedImage) return;

    setProfileImage(selectedImage);
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        body: requestData,
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("The server returned an invalid response. Please retry after restarting the backend.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update admin profile");
      }

      const updatedUser = {
        ...user,
        ...data.user,
        profileImage: data.user.profileImage || user.profileImage || "",
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("profileUpdated"));

      setUser(updatedUser);
      setFormData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        city: updatedUser.city || "",
        state: updatedUser.state || "",
        pincode: updatedUser.pincode || "",
      });
      setProfileImage(null);
      setImagePreview(updatedUser.profileImage ? `${API_URL}${updatedUser.profileImage}` : "");
      setMessage("Admin profile updated successfully");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update admin profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-title">
          <div>
            <p>ADMIN ACCOUNT</p>
            <h1>Admin Profile</h1>
          </div>

          {!editing && (
            <button
              type="button"
              className="edit-profile-btn"
              onClick={() => {
                setEditing(true);
                setMessage("");
                setError("");
              }}
            >
              Edit Admin
            </button>
          )}
        </div>

        {message && <div className="profile-success">{message}</div>}
        {error && <div className="profile-error">{error}</div>}

        <div className="profile-card">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {imagePreview ? (
                <img src={imagePreview} alt="Admin profile" />
              ) : (
                user.name ? user.name.charAt(0).toUpperCase() : "A"
              )}
            </div>

            {editing && (
              <label className="profile-image-label">
                Change Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div className="profile-user">
            <h2>{user.name}</h2>
            <span>{user.email}</span>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="profile-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="profile-field">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="profile-field full">
              <label>Address</label>
              <textarea
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                disabled={!editing}
                rows="4"
              />
            </div>

            <div className="profile-field">
              <label>City</label>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="profile-field">
              <label>State</label>
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            <div className="profile-field">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            {editing && (
              <div className="profile-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    setMessage("");
                    setProfileImage(null);
                    setImagePreview(user.profileImage ? `${API_URL}${user.profileImage}` : "");
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="save-profile-btn" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
