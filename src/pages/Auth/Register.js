import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your registration logic here
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    console.log('Registration attempt with:', formData);
    // For demo purposes, just redirect to home after registration
    navigate('/');
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form">
          <h2>Create Account</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className="register-input"
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email"
                className="register-input"
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
                className="register-input"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm Password"
                className="register-input"
              />
            </div>
            <button type="submit" className="register-button">Sign Up</button>
            <div className="register-footer">
              <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
            </div>
          </form>
        </div>
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome!</h1>
            <p>Join us and discover amazing products and services</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;