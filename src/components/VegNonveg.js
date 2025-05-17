import React, { useState } from "react";
import "./VegNonVegToggle.css";

const VegNonVegToggle = () => {
  // Default to Veg (green)
  const [isVeg, setIsVeg] = useState(true);

  const toggleVegNonVeg = () => {
    setIsVeg(!isVeg);
  };

  return (
    <div className="veg-nonveg-container">
      <span style={{
        color: isVeg ? '#1e7d22' : '#b71c1c',
        fontWeight: 600,
        marginRight: 10,
        fontSize: 18
      }}>{isVeg ? "Veg" : "Non-Veg"}</span>
      <div
        className={`veg-toggle-switch ${isVeg ? "veg" : "nonveg"}`}
        onClick={toggleVegNonVeg}
        style={{
          background: isVeg ? '#4caf50' : '#e53935',
          border: '2px solid ' + (isVeg ? '#1e7d22' : '#b71c1c'),
          transition: 'background 0.3s, border 0.3s',
          width: 54,
          height: 28,
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          padding: 4,
          boxSizing: 'border-box'
        }}
      >
        <div
          className="veg-toggle-circle"
          style={{
            background: '#fff',
            width: 20,
            height: 20,
            borderRadius: '50%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            transform: isVeg ? 'translateX(0)' : 'translateX(26px)',
            transition: 'transform 0.3s'
          }}
        ></div>
      </div>
    </div>
  );
};

export default VegNonVegToggle;
