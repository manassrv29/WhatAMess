import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import './Cart.css';
import Avatar from '@mui/material/Avatar';
import StaticDeliveryAssigned from './StaticDeliveryAssigned';

const Cart = () => {
  const location = useLocation();
  const { selectedItems, messName } = location.state || { selectedItems: [], messName: "" };

  // --- Static Cart State ---
  const [showAssigned, setShowAssigned] = useState(false);
  const [showPanel, setShowPanel] = useState(true);

  // Dummy cart summary (static)
  const totalPrice = selectedItems.reduce((total, item) => {
    let priceNum = typeof item.price === 'number' ? item.price : parseInt((item.price + '').replace(/[^\d]/g, ''));
    return total + priceNum * (item.quantity || 1);
  }, 0);

  // Simulate order flow
  const handlePlaceOrder = () => setShowAssigned(true);

  if (showAssigned) return <StaticDeliveryAssigned showPanel={showPanel} blackTheme={true} />;

  return (
    <div className="cart-black-bg">
      <div className="cart-black-card">
        <h1 className="cart-black-title">Here's your items, Checkout!</h1>
        <h2 className="cart-black-mess-name">Food Mess At Service: {messName}</h2>
        <div className="cart-black-container">
          {/* Cart Items */}
          <div className="cart-black-items">
            {selectedItems.map((item, idx) => (
              <div key={item.id || item._id || idx} className="cart-black-item">
                <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: '#23272f', color: '#f9d923', fontWeight: 700, fontSize: 24 }}>
                  {item.name ? item.name[0].toUpperCase() : '?'}
                </Avatar>
                <div className="cart-black-item-details">
                  <h3>{item.name}</h3>
                  <p>{item.price}</p>
                  <div className="cart-black-quantity-controls">
                    <span>Quantity: {item.quantity}</span>
                  </div>
                </div>
                <p className="cart-black-item-total">
                  ₹{typeof item.price === 'number' ? item.price : parseInt((item.price + '').replace(/[^\d]/g, '')) * (item.quantity || 1)}
                </p>
              </div>
            ))}
          </div>
          <div className="cart-black-summary">
            <div className="cart-black-total">Total: <b>₹{totalPrice}</b></div>
            <button className="cart-black-btn" onClick={handlePlaceOrder}>Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;