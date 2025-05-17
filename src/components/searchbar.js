import React from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = () => {
  return (
    <div className="search-container">
      <div className="search-box">
        <FaSearch style={{ marginRight: "20px", color: "gray" }} />
        <input type="text" placeholder="Search For Mess Nearby..." />
      </div>
      <div className="search-box">
        <FaSearch style={{ marginRight: "20px", color: "gray" }} />
        <input type="text" placeholder="Food For Your Mood!" />
      </div>
    </div>
  );
};

export default SearchBar;
