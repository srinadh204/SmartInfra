import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import AnimatedBackground from "../components/AnimatedBackground";

function Login() {
  const [isToggled, setIsToggled] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Clear form on component mount
  useEffect(() => {
    setRegName("");
    setRegEmail("");
    setRegMobile("");
    setRegPassword("");
    setRegRole("Citizen");
    setLoginEmail("");
    setLoginPassword("");
    setLoginRole("Citizen");
    setShowForgotPassword(false);
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setOtpSent(false);
    setErrorMsg("");
    setRegEmailTouched(false);
    setRegEmailVerified(false);
    setRegEmailOtpSent(false);
    setRegEmailOtp("");
    setRegOtpTimer(0);
  }, []);

  // Form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regEmailTouched, setRegEmailTouched] = useState(false);
  const [regEmailVerified, setRegEmailVerified] = useState(false);
  const [regEmailOtpSent, setRegEmailOtpSent] = useState(false);
  const [regEmailOtp, setRegEmailOtp] = useState("");
  const [regOtpTimer, setRegOtpTimer] = useState(0);
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Citizen");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState("Citizen");
  const [loginAdminSecret, setLoginAdminSecret] = useState("");
  const [regAdminSecret, setRegAdminSecret] = useState("");

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (regOtpTimer <= 0) return;
    const interval = setInterval(() => {
      setRegOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [regOtpTimer]);

  const handleToggle = () => {
    setIsToggled(!isToggled);
    setShowForgotPassword(false);
    setOtpSent(false);
    setErrorMsg("");
    setLoginEmail("");
    setLoginPassword("");
    setLoginAdminSecret("");
    setRegName("");
    setRegEmail("");
    setRegMobile("");
    setRegPassword("");
    setRegAdminSecret("");
    setRegEmailTouched(false);
    setRegEmailVerified(false);
    setRegEmailOtpSent(false);
    setRegEmailOtp("");
    setRegOtpTimer(0);
  };

  // Send OTP to register email
  const handleSendRegEmailOtp = async () => {
    if (!validateEmail(regEmail)) {
      setRegEmailTouched(true);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setRegEmailOtpSent(true);
        setRegOtpTimer(60);
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Failed to send OTP. Try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP for register email
  const handleVerifyRegEmailOtp = async () => {
    if (!regEmailOtp || regEmailOtp.length < 4) {
      setErrorMsg("Please enter the OTP sent to your email.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, otp: regEmailOtp }),
      });
      const data = await response.json();
      if (response.ok) {
        setRegEmailVerified(true);
        setRegEmailOtpSent(false);
        setRegEmailOtp("");
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    setLoading(true); setErrorMsg("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setErrorMsg(data.message || "OTP has been successfully sent.");
      } else {
        setErrorMsg(data.message || "Failed to send reset link.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTPAndReset = async (e) => {
    e.preventDefault();
    if (!resetOtp || !newPassword) {
      setErrorMsg("Please enter both the OTP and a new password.");
      return;
    }
    setLoading(true); setErrorMsg("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword: newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setErrorMsg("Password reset successfully! You can now log in.");
        setTimeout(() => {
          setShowForgotPassword(false);
          setOtpSent(false);
          setResetEmail("");
          setResetOtp("");
          setNewPassword("");
          setErrorMsg("");
        }, 3000);
      } else {
        setErrorMsg(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(""); setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, role: loginRole, adminSecret: loginRole === "Admin" ? loginAdminSecret : undefined }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.user.role !== loginRole) {
          setErrorMsg(`Access denied. You are restricting as ${loginRole}, but registered as ${data.user.role}.`);
          return;
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role }));
        navigate(data.user.role === "Admin" ? "/admin" : "/home");
      } else {
        setErrorMsg(data.message || "Login failed");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateEmail(regEmail)) {
      setRegEmailTouched(true);
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!regEmailVerified) {
      setErrorMsg("Please verify your email address before registering.");
      return;
    }
    setErrorMsg(""); setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName, email: regEmail, mobile: regMobile, password: regPassword, role: regRole, adminSecret: regRole === "Admin" ? regAdminSecret : undefined
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role }));
        navigate(data.user.role === "Admin" ? "/admin" : "/home");
      } else {
        setErrorMsg(data.message || "Registration failed");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <AnimatedBackground />

      <div className="auth-left animate-fade-in">
        <div className="auth-form-container glass-panel">
          <div className="auth-form-header">
            <h2>{showForgotPassword ? "Reset Password" : isToggled ? "Create Account" : "Welcome Back"}</h2>
            <p>{showForgotPassword ? "Follow the steps to reset your password." : isToggled ? "Sign up to report infrastructure damage." : "Sign in to monitor your reports."}</p>
          </div>

          {errorMsg && (
            <div style={{
              background: errorMsg.includes("successful") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: errorMsg.includes("successful") ? "var(--success)" : "var(--danger)",
              border: `1px solid ${errorMsg.includes("successful") ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              padding: "12px", borderRadius: "8px", marginBottom: "20px", textAlign: "center", fontSize: "0.9rem"
            }}>
              {errorMsg}
            </div>
          )}

          {showForgotPassword ? (
            !otpSent ? (
              <form onSubmit={handleSendOTP} className="animate-fade-in delay-1" autoComplete="off">
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="email" className="input-field" placeholder="name@example.com"
                    required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} autoComplete="off" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP via Email"}
                </button>
                <div className="auth-switch">
                  Remember your password? <span onClick={() => { setShowForgotPassword(false); setErrorMsg(""); }}>Back to Login</span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTPAndReset} className="animate-fade-in delay-1" autoComplete="off">
                <div className="input-group">
                  <label className="input-label">Enter OTP</label>
                  <input type="text" className="input-field" placeholder="6-digit OTP"
                    required value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} autoComplete="off" />
                </div>
                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <input type="password" className="input-field" placeholder="Create a new password"
                    required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
                  {loading ? "Resetting..." : "Verify OTP & Reset"}
                </button>
                <div className="auth-switch">
                  Wait, I remember it! <span onClick={() => { setShowForgotPassword(false); setOtpSent(false); setErrorMsg(""); }}>Back to Login</span>
                </div>
              </form>
            )
          ) : !isToggled ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="animate-fade-in delay-1" autoComplete="off">
              <div className="input-group">
                <label className="input-label">Select Your Role</label>
                <div className="role-picker">
                  <button
                    type="button"
                    className={`role-card ${loginRole === "Citizen" ? "role-card--active role-card--citizen" : ""}`}
                    onClick={() => setLoginRole("Citizen")}
                  >
                    <div className="role-card__icon">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div className="role-card__body">
                      <span className="role-card__title">Citizen</span>
                      <span className="role-card__desc">Report &amp; track issues</span>
                    </div>
                    {loginRole === "Citizen" && <span className="role-card__check">✓</span>}
                  </button>

                  <button
                    type="button"
                    className={`role-card ${loginRole === "Admin" ? "role-card--active role-card--admin" : ""}`}
                    onClick={() => setLoginRole("Admin")}
                  >
                    <div className="role-card__icon">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div className="role-card__body">
                      <span className="role-card__title">Admin</span>
                      <span className="role-card__desc">Manage &amp; resolve</span>
                    </div>
                    {loginRole === "Admin" && <span className="role-card__check">✓</span>}
                  </button>
                </div>
              </div>

              {loginRole === "Admin" && (
                <div className="input-group animate-fade-in">
                  <label className="input-label">Admin Unique Key</label>
                  <input type="password" className="input-field" placeholder="Enter admin key"
                    required value={loginAdminSecret} onChange={(e) => setLoginAdminSecret(e.target.value)} autoComplete="new-password" />
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field" placeholder="name@example.com"
                  required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="off" />
              </div>

              <div className="input-group">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
                  <span onClick={() => { setShowForgotPassword(true); setErrorMsg(""); }} style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", cursor: "pointer", fontWeight: 600, transition: "color 0.3s ease" }}>Forgot Password?</span>
                </div>
                <input type="password" className="input-field" placeholder="••••••••"
                  required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="new-password" />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
                {loading ? "Authenticating..." : "Sign In"}
              </button>
              <div className="auth-switch">
                New User? <span onClick={handleToggle}>Create an account</span>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="animate-fade-in delay-1" autoComplete="off">
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" placeholder="John Doe"
                  required value={regName} onChange={(e) => setRegName(e.target.value)} autoComplete="off" />
              </div>

              {/* Email with validation + OTP verification */}
              <div className="input-group">
                <label className="input-label">Email</label>

                {/* Email input row with Send OTP button */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="john@example.com"
                    required
                    value={regEmail}
                    disabled={regEmailVerified}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      setRegEmailTouched(true);
                      setRegEmailVerified(false);
                      setRegEmailOtpSent(false);
                      setRegEmailOtp("");
                    }}
                    onBlur={() => setRegEmailTouched(true)}
                    autoComplete="off"
                    style={{
                      flex: 1,
                      borderColor: regEmailTouched
                        ? regEmailVerified
                          ? "rgba(16, 185, 129, 0.7)"
                          : validateEmail(regEmail)
                          ? "rgba(59, 130, 246, 0.5)"
                          : "rgba(239, 68, 68, 0.6)"
                        : undefined,
                      outline: "none",
                      opacity: regEmailVerified ? 0.7 : 1,
                    }}
                  />

                  {!regEmailVerified && (
                    <button
                      type="button"
                      onClick={handleSendRegEmailOtp}
                      disabled={loading || !validateEmail(regEmail) || regOtpTimer > 0}
                      style={{
                        padding: "0 14px",
                        height: "44px",
                        borderRadius: "8px",
                        border: "1px solid rgba(59,130,246,0.5)",
                        background: "rgba(59,130,246,0.1)",
                        color: "var(--accent-cyan, #38bdf8)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: validateEmail(regEmail) && regOtpTimer === 0 ? "pointer" : "not-allowed",
                        whiteSpace: "nowrap",
                        opacity: validateEmail(regEmail) && regOtpTimer === 0 ? 1 : 0.5,
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      {regOtpTimer > 0 ? `Resend (${regOtpTimer}s)` : regEmailOtpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  )}
                </div>

                {/* Status hint below email */}
                {regEmailTouched && (
                  <div style={{
                    marginTop: "6px", fontSize: "0.8rem",
                    display: "flex", alignItems: "center", gap: "6px",
                    color: regEmailVerified
                      ? "var(--success)"
                      : validateEmail(regEmail)
                      ? "var(--accent-cyan, #38bdf8)"
                      : "var(--danger)",
                  }}>
                    {regEmailVerified ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Email verified successfully
                      </>
                    ) : validateEmail(regEmail) ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {regEmailOtpSent ? "OTP sent — check your inbox" : "Click Send OTP to verify your email"}
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {regEmail.length === 0
                          ? "Email is required"
                          : !regEmail.includes("@")
                          ? "Missing @ symbol"
                          : !regEmail.split("@")[1]?.includes(".")
                          ? "Missing domain (e.g. gmail.com)"
                          : "Enter a valid email (e.g. john@gmail.com)"}
                      </>
                    )}
                  </div>
                )}

                {/* OTP input box — shown after OTP sent and not yet verified */}
                {regEmailOtpSent && !regEmailVerified && (
                  <div className="animate-fade-in" style={{ marginTop: "12px" }}>
                    <label className="input-label" style={{ marginBottom: "6px", display: "block" }}>Enter OTP</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="6-digit OTP"
                        maxLength={6}
                        value={regEmailOtp}
                        onChange={(e) => setRegEmailOtp(e.target.value.replace(/\D/g, ""))}
                        autoComplete="one-time-code"
                        style={{
                          flex: 1,
                          letterSpacing: "0.2em",
                          textAlign: "center",
                          fontSize: "1.1rem",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyRegEmailOtp}
                        disabled={loading || regEmailOtp.length < 4}
                        style={{
                          padding: "0 18px",
                          height: "44px",
                          borderRadius: "8px",
                          border: "none",
                          background: regEmailOtp.length >= 4 ? "var(--accent-primary, #3b82f6)" : "rgba(59,130,246,0.2)",
                          color: "#fff",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: regEmailOtp.length >= 4 ? "pointer" : "not-allowed",
                          transition: "all 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        {loading ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                    <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "var(--text-muted, #94a3b8)" }}>
                      OTP expires in 10 minutes.{" "}
                      {regOtpTimer > 0 ? (
                        <span>Resend in {regOtpTimer}s</span>
                      ) : (
                        <span
                          onClick={handleSendRegEmailOtp}
                          style={{ color: "var(--accent-cyan, #38bdf8)", cursor: "pointer", fontWeight: 600 }}
                        >
                          Resend OTP
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Mobile Number</label>
                <input type="tel" className="input-field" placeholder="+1 234 567 890"
                  required value={regMobile} onChange={(e) => setRegMobile(e.target.value)} autoComplete="off" />
              </div>

              {/* Role Picker — Register */}
              <div className="input-group">
                <label className="input-label">Select Your Role</label>
                <div className="role-picker">
                  <button
                    type="button"
                    className={`role-card ${regRole === "Citizen" ? "role-card--active role-card--citizen" : ""}`}
                    onClick={() => setRegRole("Citizen")}
                  >
                    <div className="role-card__icon">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div className="role-card__body">
                      <span className="role-card__title">Citizen</span>
                      <span className="role-card__desc">Report &amp; track issues</span>
                    </div>
                    {regRole === "Citizen" && <span className="role-card__check">✓</span>}
                  </button>

                  <button
                    type="button"
                    className={`role-card ${regRole === "Admin" ? "role-card--active role-card--admin" : ""}`}
                    onClick={() => setRegRole("Admin")}
                  >
                    <div className="role-card__icon">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div className="role-card__body">
                      <span className="role-card__title">Admin</span>
                      <span className="role-card__desc">Manage &amp; resolve</span>
                    </div>
                    {regRole === "Admin" && <span className="role-card__check">✓</span>}
                  </button>
                </div>
              </div>

              {regRole === "Admin" && (
                <div className="input-group animate-fade-in">
                  <label className="input-label">Admin Unique Key</label>
                  <input type="password" className="input-field" placeholder="Enter admin key"
                    required value={regAdminSecret} onChange={(e) => setRegAdminSecret(e.target.value)} autoComplete="new-password" />
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" className="input-field" placeholder="Create a strong password"
                  required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} autoComplete="new-password" />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "8px" }}
                disabled={loading || !regEmailVerified || (regEmailTouched && !validateEmail(regEmail))}
              >
                {loading ? "Creating..." : "Register & Login"}
              </button>
              <div className="auth-switch">
                Already registered? <span onClick={handleToggle}>Sign in here</span>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="auth-right animate-fade-in delay-2" style={{ position: "relative", overflow: "hidden" }}>

        {/* Decorative Floating Elements */}
        <div style={{ position: "absolute", top: "15%", left: "10%", width: "300px", height: "300px", background: "var(--accent-primary)", filter: "blur(100px)", opacity: 0.15, borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: "300px", height: "300px", background: "var(--accent-cyan)", filter: "blur(100px)", opacity: 0.15, borderRadius: "50%" }}></div>

        <div className="auth-hero-text" style={{ padding: "0 40px", maxWidth: "600px", width: "100%", textAlign: "left", zIndex: 3 }}>
          <h1 style={{ fontSize: "4rem", marginBottom: "16px", background: "linear-gradient(135deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textAlign: "left" }}>Smart Infra</h1>
          <p style={{ fontSize: "1.25rem", color: "#cbd5e1", lineHeight: 1.6, marginBottom: "60px", textAlign: "left" }}>The next-generation digital platform empowering citizens to report infrastructure damages instantly and track municipal responses in real-time.</p>

          <div style={{ display: "flex", gap: "24px", flexWrap: "nowrap", width: "100%" }}>

            {/* Mock Card 1 */}
            <div style={{ flex: 1, background: "rgba(24, 24, 27, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "24px", transform: "translateY(20px)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                </div>
                <h4 style={{ margin: 0, color: "white", fontSize: "1.1rem" }}>Active Sync</h4>
              </div>
              <div style={{ height: "8px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "8px" }}>
                <div style={{ height: "100%", width: "75%", background: "linear-gradient(90deg, #3b82f6, #06b6d4)", borderRadius: "4px" }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8" }}>
                <span>Routing Tasks</span>
                <span>Processing...</span>
              </div>
            </div>

            {/* Mock Card 2 */}
            <div style={{ flex: 1, background: "rgba(24, 24, 27, 0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "24px", transform: "translateY(-20px)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h4 style={{ margin: 0, color: "white", fontSize: "1.1rem" }}>Resolution</h4>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1, marginBottom: "8px" }}>94%</div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>City infrastructure recovery rate verified this month.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;