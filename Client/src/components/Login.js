import React, { useState } from 'react';
import "./Login.css";
import { useNavigate } from 'react-router-dom';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('email', data.user.email);
        navigate('/profile');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
      </form>

      <div style={{ marginTop: '12px' }}>
        <button 
          className="link-button" 
          onClick={() => navigate('/Forgot-pass')}
        >
          Forgot Password?
        </button>
      </div>
      <div style={{ marginTop: '8px' }}>
        <span>Don't have an account? </span>
        <button 
          className="link-button" 
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Login;