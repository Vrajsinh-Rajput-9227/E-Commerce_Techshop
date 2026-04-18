import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state
  const from = location.state?.from || '/';
  const message = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // For demo purposes, accept any email/password and create user data
    const userName = formData.email.split('@')[0];
    const userData = {
      email: formData.email,
      name: userName.charAt(0).toUpperCase() + userName.slice(1),
      id: Date.now().toString()
    };

    login(userData);
    navigate(from, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h2>Login to Your Account</h2>
          {message && <div className="info-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email"
                className="login-input"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="login-input"
              />
            </div>
            <button type="submit" className="login-button">Login</button>
            <div className="login-footer">
              <p>Don't have an account? <Link to="/register" className="auth-link">Register here</Link></p>
              <p><Link to="/forgot-password" className="auth-link">Forgot Password?</Link></p>
            </div>
          </form>
        </div>
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;