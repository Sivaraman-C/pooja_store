import React, { useEffect, useState } from "react";
import "./Admins.css";

import API_URL from "../../../apiConfig";

const Admins = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [admins, setAdmins] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentRole = currentUser?.role || "";
  const requestHeaders = {
    "Content-Type": "application/json",
    "x-user-role": currentUser?.role || "",
  };

  const loadAdmins = async () => {
    const response = await fetch(`${API_URL}/api/auth/admin/users`, {
      headers: requestHeaders,
    });
    if (response.ok) setAdmins(await response.json());
  };

  useEffect(() => {
    fetch(`${API_URL}/api/auth/admin/users`, {
      headers: { "x-user-role": currentRole },
    })
      .then((response) => response.ok ? response.json() : [])
      .then(setAdmins)
      .catch((loadError) => setError(loadError.message));
  }, [currentRole]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`${API_URL}/api/auth/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentUser?.role || "",
        },
        body: JSON.stringify(formData),
      });
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          "The server returned an invalid response. Please restart the backend."
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setMessage(`${data.user.name} was added as ${data.user.role}.`);
      setFormData({ name: "", email: "", password: "", role: "admin" });
      loadAdmins();
    } catch (submitError) {
      setError(submitError.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const updateAdmin = async (admin) => {
    const name = window.prompt("Admin name", admin.name);
    const email = window.prompt("Admin email", admin.email);
    if (!name || !email) return;

    const role = window.prompt("Role: admin or super_admin", admin.role);
    if (!["admin", "super_admin"].includes(role)) return;

    const response = await fetch(`${API_URL}/api/auth/admin/users/${admin.id}`, {
      method: "PUT",
      headers: requestHeaders,
      body: JSON.stringify({ name, email, role }),
    });
    if (response.ok) loadAdmins();
  };

  const deleteAdmin = async (admin) => {
    if (!window.confirm(`Delete ${admin.name}?`)) return;
    const response = await fetch(`${API_URL}/api/auth/admin/users/${admin.id}`, {
      method: "DELETE",
      headers: requestHeaders,
    });
    if (response.ok) setAdmins(admins.filter((item) => item.id !== admin.id));
  };

  return (
    <div className="admins-admin">
      <div className="admins-title">
        <p>ACCESS MANAGEMENT</p>
        <h1>Add Admin</h1>
        <span>Create a new account and choose its access role.</span>
      </div>

      <form className="admins-form" onSubmit={handleSubmit}>
        <div className="admins-field">
          <label htmlFor="admin-name">Full Name</label>
          <input id="admin-name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="admins-field">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="admins-field">
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" name="password" type="password" value={formData.password} onChange={handleChange} minLength="6" required />
        </div>

        <div className="admins-field">
          <label htmlFor="admin-role">Role</label>
          <select id="admin-role" name="role" value={formData.role} onChange={handleChange} required>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="user">Customer</option>
          </select>
        </div>

        {message && <p className="admins-success">{message}</p>}
        {error && <p className="admins-error">{error}</p>}

        <button className="admins-submit" type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Account"}
        </button>
      </form>

      <div className="admins-list">
        <h2>Admin Accounts</h2>
        {admins.map((admin) => (
          <div className="admin-row" key={admin.id}>
            <div>
              <strong>{admin.name}</strong>
              <span>{admin.email} · {admin.role}</span>
            </div>
            <div className="admin-row-actions">
              <button onClick={() => updateAdmin(admin)}>Edit</button>
              <button onClick={() => deleteAdmin(admin)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admins;
