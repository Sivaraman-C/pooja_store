import React from "react";
import "./LogoutPopup.css";

const LogoutPopup = ({ onCancel, onConfirm }) => {
  return (
    <div className="logout-popup-overlay" onClick={onCancel}>
      <div
        className="logout-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-popup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="logout-popup-close"
          aria-label="Close logout confirmation"
          onClick={onCancel}
        >
          &times;
        </button>
        <div className="logout-popup-icon">&#8594;</div>
        <h2 id="logout-popup-title">Log out of your account?</h2>
        <p>You can sign in again whenever you are ready.</p>
        <div className="logout-popup-actions">
          <button className="logout-popup-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="logout-popup-confirm" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopup;
