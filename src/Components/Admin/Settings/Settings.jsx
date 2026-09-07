import React, { useState } from "react";
import "./Settings.css";

const defaultSettings = {
  storeName: "Devaloka",
  storeTagline: "Handcrafted essentials for everyday rituals",
  supportEmail: "hello@devaloka.in",
  supportPhone: "+91 98765 43210",
  currency: "INR",
  timezone: "Asia/Kolkata",
  maintenanceMode: false,
  lowStockAlert: true,
  orderNotifications: true,
  customerEmails: true,
};

const Settings = () => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("admin-settings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = (event) => {
    const { name, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem("admin-settings", JSON.stringify(settings));
    setMessage("Settings saved successfully.");
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <p>STORE SETTINGS</p>
          <h1>General Settings</h1>
        </div>
        <button type="button" className="settings-btn-primary" onClick={handleSubmit}>
          Save Changes
        </button>
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="settings-card settings-card-wide">
          <div className="settings-card-header">
            <h2>Store Profile</h2>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="storeName">Store Name</label>
              <input
                id="storeName"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="settings-field settings-field-full">
              <label htmlFor="storeTagline">Store Tagline</label>
              <input
                id="storeTagline"
                name="storeTagline"
                value={settings.storeTagline}
                onChange={handleChange}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="supportEmail">Support Email</label>
              <input
                id="supportEmail"
                name="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={handleChange}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="supportPhone">Support Phone</label>
              <input
                id="supportPhone"
                name="supportPhone"
                value={settings.supportPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <h2>Store Operations</h2>
          </div>

          <div className="settings-toggle-list">
            <label className="settings-toggle-item">
              <span>
                <strong>Maintenance Mode</strong>
                <small>Temporarily hide the shop while updates are running.</small>
              </span>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleToggle}
              />
            </label>

            <label className="settings-toggle-item">
              <span>
                <strong>Low Stock Alerts</strong>
                <small>Notify admins when inventory is running low.</small>
              </span>
              <input
                type="checkbox"
                name="lowStockAlert"
                checked={settings.lowStockAlert}
                onChange={handleToggle}
              />
            </label>

            <label className="settings-toggle-item">
              <span>
                <strong>Order Notifications</strong>
                <small>Send updates when new orders are placed.</small>
              </span>
              <input
                type="checkbox"
                name="orderNotifications"
                checked={settings.orderNotifications}
                onChange={handleToggle}
              />
            </label>

            <label className="settings-toggle-item">
              <span>
                <strong>Customer Emails</strong>
                <small>Enable email communication for customers.</small>
              </span>
              <input
                type="checkbox"
                name="customerEmails"
                checked={settings.customerEmails}
                onChange={handleToggle}
              />
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <h2>Regional Settings</h2>
          </div>

          <div className="settings-field">
            <label htmlFor="timezone">Time Zone</label>
            <select
              id="timezone"
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>

          <div className="settings-note">
            This setting controls order timestamps, daily reports, and store activity.
          </div>
        </div>

        {message && <p className="settings-message">{message}</p>}
      </form>
    </div>
  );
};

export default Settings;
