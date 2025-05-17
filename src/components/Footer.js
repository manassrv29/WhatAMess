import React from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer pro-footer">
      <div className="pro-footer-row">
        <div className="pro-footer-section pro-footer-brand">
          <div className="pro-footer-logo">What A Mess</div>
          <div className="pro-footer-about">
            Delicious, homemade food delivered to your doorstep.
          </div>
          <div className="pro-footer-copyright">
            &copy; {currentYear} What A Mess
          </div>
        </div>
        <div className="pro-footer-section pro-footer-links">
          <div className="pro-footer-title">Quick Links</div>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/customer-dashboard">Messes</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
        <div className="pro-footer-section pro-footer-social">
          <div className="pro-footer-title">Follow Us</div>
          <div className="pro-footer-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;