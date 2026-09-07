import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_URL, { bypassHeaders } from "../apiConfig";

import "./LoginSignup.css";

const LoginSignup = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Input, 2: OTP, 3: Register Details

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otp: "",
    pincode: "",
    city: "",
    state: "",
    identifier: "", // Email or Phone for login
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-fetch City/State if Pincode is 6 digits
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
        setSuccess(`Located: ${postOffice.District}, ${postOffice.State}`);
      } else {
        setError("Invalid Pincode");
      }
    } catch (err) {
      console.error("Location fetch error:", err);
    }
  };

  const togglePasswords = () => setShowPasswords(!showPasswords);

  // ==========================================
  // REGISTRATION - STEP 1 (GET OTP)
  // ==========================================
  const handleRegisterGetOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({ phone: formData.phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSuccess("OTP sent successfully to " + formData.phone);
      setStep(2);
    } catch (err) {
      console.error("Login fetch error:", err);
      setError(`Connection Error: ${err.message}. Ensure your laptop is on IP 192.168.1.8 and server is running.`);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIN - STEP 1 (VERIFY PASSWORD -> GET OTP)
  // ==========================================
  const handleLoginGetOtp = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      setError("Identifier and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({ identifier: formData.identifier, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSuccess(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP (FOR BOTH)
  // ==========================================
  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      setError("Please enter OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify({
          phone: formData.phone,
          identifier: formData.identifier,
          otp: formData.otp,
          type: isLogin ? "login" : "register"
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("profileUpdated"));
        window.dispatchEvent(new Event("cartUpdated"));
        navigate(["admin", "super_admin"].includes(data.user.role) ? "/admin" : "/");
      } else {
        setSuccess("OTP Verified! Please set your password.");
        setStep(3);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FINAL REGISTRATION
  // ==========================================
  const handleFinalRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...bypassHeaders },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSuccess("Account created! Please login.");
      setIsLogin(true);
      setStep(1);
      setFormData({ ...formData, otp: "", password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <p className="login-label">DEVALOKA</p>
          <h1>{step === 3 ? "Register" : isLogin ? "Login" : "Sign Up"}</h1>

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          {/* STEP 1: INITIAL INPUT */}
          {step === 1 && (
            isLogin ? (
              <form onSubmit={handleLoginGetOtp}>
                <div className="form-group">
                  <label>Email or Mobile Number</label>
                  <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} required />
                </div>
                <div className="form-group password-field-group">
                  <label>Password</label>
                  <div className="input-with-eye">
                    <input type={showPasswords ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required />
                    <span className="eye-icon" onClick={togglePasswords}>{showPasswords ? "👁️" : "👁️‍🗨️"}</span>
                  </div>
                </div>
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? "Please wait..." : "Get OTP to Login"}
                </button>
              </form>
            ) : (
              <div className="register-init">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="tel" name="phone" placeholder="Enter mobile number" value={formData.phone} onChange={handleChange} />
                </div>
                <button className="login-submit" onClick={handleRegisterGetOtp} disabled={loading}>
                  {loading ? "Sending..." : "Get OTP"}
                </button>
              </div>
            )
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <div className="otp-verification">
              <div className="form-group">
                <label>Verification Code</label>
                <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={formData.otp} onChange={handleChange} />
              </div>
              <button className="login-submit" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying..." : isLogin ? "Login" : "Verify & Continue"}
              </button>
              <button className="back-btn" onClick={() => setStep(1)}>Go Back</button>
            </div>
          )}

          {/* STEP 3: REGISTRATION DETAILS */}
          {step === 3 && (
            <form onSubmit={handleFinalRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Pincode (Location)</label>
                <input type="text" name="pincode" placeholder="Enter 6-digit Pincode" value={formData.pincode} onChange={handleChange} required />
              </div>
              <div className="form-group-row" style={{display:'flex', gap:'10px'}}>
                <div className="form-group" style={{flex:1}}>
                  <label>City</label>
                  <input type="text" name="city" value={formData.city} readOnly style={{background: '#f9f9f9'}} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label>State</label>
                  <input type="text" name="state" value={formData.state} readOnly style={{background: '#f9f9f9'}} />
                </div>
              </div>
              <div className="form-group password-field-group">
                <label>Password</label>
                <div className="input-with-eye">
                  <input type={showPasswords ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required />
                  <span className="eye-icon" onClick={togglePasswords}>{showPasswords ? "👁️" : "👁️‍🗨️"}</span>
                </div>
              </div>
              <div className="form-group password-field-group">
                <label>Confirm Password</label>
                <div className="input-with-eye">
                  <input type={showPasswords ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Saving..." : "Finish Registration"}
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="login-switch">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}>
                {isLogin ? "Register" : "Login"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
