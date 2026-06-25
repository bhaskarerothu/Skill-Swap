import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterRequest = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        alert("OTP sent to your email!");
        setStep(2);
      } else {
        setError(data.message || "Registration request failed!");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        localStorage.setItem("email", formData.email);
        navigate("/skillsform");
      } else {
        setError(data.message || "OTP verification failed!");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="register-page">
      {step === 1 && (
        <form className="register-form" onSubmit={handleRegisterRequest}>
          <h2>Register</h2>
          <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          {error && <div className="error">{error}</div>}
          <button type="submit">Send OTP</button>
        </form>
      )}

      {step === 2 && (
        <form className="register-form" onSubmit={handleVerifyOtp}>
          <h2>Verify OTP</h2>
          <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          {error && <div className="error">{error}</div>}
          <button type="submit">Verify & Register</button>
        </form>
      )}
    </div>
  );
};

export default Register;
