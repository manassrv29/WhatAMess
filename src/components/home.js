import React from "react";
import { Link } from "react-router-dom";
import "../components/home.css";
import logo from "../components/WhatAMess.png";

const Home = () => {
  return (
    <div className="home-container">
      {/* Large Background "M" */}
      <div className="background-m">M</div>

      {/* Logo Section */}
      <div className="logo-container">
        <img src={logo} alt="What A Mess" className="logo" />
      </div>

      {/* Description Text */}
      <p className="description">
        Bringing fresh, homely meals from nearby messes <br />
        to your doorstep – fast, reliable, and hassle-free.
      </p>

      {/* Buttons Section */}
      <div className="button-container">
        <Link to="/login" className="full-width">
          <button className="btn login-btn">Log In</button>
        </Link>
        <Link to="/signup" className="full-width">
          <button className="btn signup-btn">Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
