import React from "react";
import { Link } from "react-router-dom";
import "../components/Auth.css";
import logo from "../components/WhatAMess.png"; // Importing the logo

const Signup = () => {
  return (
    <div className="auth-container">
      {/* Logo Section */}
      <div className="logo-container">
        <img src={logo} alt="What A Mess" className="auth-logo" />
      </div>

      {/* Signup Form */}
      <div className="auth-box">
        <h2 className="auth-title">Create Your Account</h2>

        <form className="auth-form">
          <div className="input-group">
            <label htmlFor="fullname">Full Name</label>
            <input type="text" id="fullname" placeholder="Enter your full name" required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="Enter your email" required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Create a password" required />
          </div>

          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" placeholder="Confirm your password" required />
          </div>

          {/* Terms and Conditions */}
          <p className="terms-text">
            By signing up, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <button type="submit" className="btn signup-btn">Sign Up</button>
        </form>

        {/* Redirect to Login */}
        <p className="login-text">
          Already have an account? <Link to="/login" className="login-link">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
