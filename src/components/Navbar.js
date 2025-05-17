import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link for navigation
import { FaHome, FaClipboardList, FaShoppingCart, FaGift, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../utils/AuthContext";
import logo from "../components/WhatAMess.png";
import "./Navbar.css"; // Custom styling

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false); // State to manage dropdown visibility
  const dropdownRef = useRef(null); // Ref for the dropdown

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown); // Toggle dropdown visibility
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        {/* Logo linking to the homepage */}
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="What A Mess Logo" className="logo" />
        </Link>

        <div className="nav-container">
          <ul className="navbar-nav nav-box">
            {/* Home link */}
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <FaHome className="nav-icon" />
                <span>Home</span>
              </Link>
            </li>

            {/* Orders link */}
            <li className="nav-item">
              <Link className="nav-link" to="/orders">
                <FaClipboardList className="nav-icon" />
                <span>Orders</span>
              </Link>
            </li>

            {/* Cart link */}
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                <FaShoppingCart className="nav-icon" />
                <span>Cart</span>
              </Link>
            </li>

            {/* Rewards link */}
            <li className="nav-item">
              <Link className="nav-link" to="/rewards">
                <FaGift className="nav-icon" />
                <span>Reward</span>
              </Link>
            </li>

            {/* User icon with dropdown */}
            <li className="nav-item dropdown" onClick={toggleDropdown} ref={dropdownRef}>
              <div className="nav-link">
                <FaUserCircle className="nav-icon" />
                <span>{currentUser ? `Hello, ${currentUser.displayName || currentUser.email.split('@')[0]}` : 'User'}</span>
              </div>
              {showDropdown && (
                <div className="dropdown-menu">
                  {currentUser ? (
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  ) : (
                    <Link className="dropdown-item" to="/login">
                      Login
                    </Link>
                  )}
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;