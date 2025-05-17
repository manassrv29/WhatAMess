import React, { useState } from "react";
import "./WomenModeToggle.css";

const WomenModeToggle = () => {
  const [isWomenMode, setIsWomenMode] = useState(false);

  const toggleMode = () => {
    setIsWomenMode(!isWomenMode);
  };

  return (
    <div className="women-mode-container">
      <span>{isWomenMode ? "Women Mode" : "Normal Mode"}</span>
      <div 
        className={`toggle-switch ${isWomenMode ? "women" : ""}`} 
        onClick={toggleMode}
      >
        <div className="toggle-circle"></div>
      </div>
    </div>
  );
};

export default WomenModeToggle;
