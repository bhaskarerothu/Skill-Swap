import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setStep(3);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}

      <button onClick={() => navigate("/login")}>Back to Login</button>
    </div>
  );
};

export default ForgotPassword;