import React, { useState, useEffect } from "react";
import "./messorderpage.css";
import logo from "../assets/logo.png";
import axios from "axios"; // Make sure to install axios: npm install axios

const MessOrderPage = () => {
  // State for orders data that will come from the MongoDB backend
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for currently selected order
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [timeLeft, setTimeLeft] = useState({});
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch orders from the backend when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to fetch orders from MongoDB backend
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await axios.get('http://your-api-url.com/api/mess/orders');
      const ordersData = response.data;
      
      setOrders(ordersData);
      // Set the first order as selected by default if there are orders
      if (ordersData.length > 0) {
        setSelectedOrderId(ordersData[0].id);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
      setIsLoading(false);
    }
  };

  // Function to filter orders
  const filterOrders = (status) => {
    setActiveFilter(status);
    fetchFilteredOrders(status);
  };

  // Fetch filtered orders based on status
  const fetchFilteredOrders = async (status) => {
    setIsLoading(true);
    try {
      // Replace with your actual API endpoint for filtered orders
      const endpoint = status === "all" 
        ? 'http://your-api-url.com/api/mess/orders' 
        : `http://your-api-url.com/api/mess/orders?status=${status}`;
      
      const response = await axios.get(endpoint);
      setOrders(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching filtered orders:", err);
      setError("Failed to filter orders. Please try again.");
      setIsLoading(false);
    }
  };

  // Get the currently selected order
  const selectedOrder = orders.find(order => order.id === selectedOrderId) || orders[0];

  // Initialize timers for pending orders
  useEffect(() => {
    const initialTimers = {};
    orders.forEach(order => {
      if (order.status === "pending") {
        // Calculate remaining time based on order creation time and current time
        const orderTime = new Date(order.orderTime).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - orderTime) / 1000);
        const remainingSeconds = Math.max(60 - elapsedSeconds, 0); // Assuming 60 seconds to respond
        
        initialTimers[order.id] = remainingSeconds;
      }
    });
    setTimeLeft(initialTimers);
  }, [orders]);

  // Timer effect
  useEffect(() => {
    const timers = {};
    Object.keys(timeLeft).forEach(orderId => {
      if (timeLeft[orderId] > 0) {
        timers[orderId] = setTimeout(() => {
          setTimeLeft(prev => ({
            ...prev,
            [orderId]: prev[orderId] - 1
          }));
        }, 1000);
      }
    });
    
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [timeLeft]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle accept order
  const handleAcceptOrder = async () => {
    try {
      // API call to update order status to accepted
      await axios.put(`http://your-api-url.com/api/mess/orders/${selectedOrderId}/accept`);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === selectedOrderId ? { 
          ...order, 
          status: "accepted",
          deliveryStatus: "waiting" // Waiting for delivery partner assignment
        } : order
      ));
      
      // Remove the timer for this order
      setTimeLeft(prev => {
        const newTimers = { ...prev };
        delete newTimers[selectedOrderId];
        return newTimers;
      });
      
      alert("Order accepted! Looking for a delivery partner...");
    } catch (err) {
      console.error("Error accepting order:", err);
      alert("Failed to accept order. Please try again.");
    }
  };

  // Handle decline order initial click
  const handleDeclineClick = () => {
    setShowDeclineReason(true);
  };

  // Handle final decline with reason
  const handleDeclineConfirm = async () => {
    if (declineReason.trim() === "") {
      alert("Please provide a reason for declining the order.");
      return;
    }
    
    try {
      // API call to update order status to declined with reason
      await axios.put(`http://your-api-url.com/api/mess/orders/${selectedOrderId}/decline`, {
        reason: declineReason
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === selectedOrderId ? { 
          ...order, 
          status: "declined", 
          declineReason 
        } : order
      ));
      
      // Remove the timer for this order
      setTimeLeft(prev => {
        const newTimers = { ...prev };
        delete newTimers[selectedOrderId];
        return newTimers;
      });
      
      alert(`Order declined. Reason: ${declineReason}`);
      setShowDeclineReason(false);
      setDeclineReason("");
    } catch (err) {
      console.error("Error declining order:", err);
      alert("Failed to decline order. Please try again.");
    }
  };

  // Cancel declining
  const handleCancelDecline = () => {
    setShowDeclineReason(false);
    setDeclineReason("");
  };

  // Render delivery partner section based on status
  const renderDeliveryPartnerSection = () => {
    if (!selectedOrder || selectedOrder.status !== "accepted") {
      return null;
    }

    if (selectedOrder.deliveryStatus === "waiting") {
      return (
        <div className="delivery-partner-section waiting">
          <div className="delivery-header">
            <h3>Delivery Partner</h3>
            <div className="status-waiting">Waiting for assignment</div>
          </div>
          <div className="loading-animation">
            <div className="loading-spinner"></div>
            <p>Finding a delivery partner...</p>
          </div>
        </div>
      );
    }

    if (selectedOrder.deliveryPartner) {
      return (
        <div className="delivery-partner-section assigned">
          <div className="delivery-header">
            <h3>Delivery Partner</h3>
            <div className="status-assigned">Assigned</div>
          </div>
          <div className="partner-details">
            <div className="partner-info">
              <div className="partner-avatar">
                {selectedOrder.deliveryPartner.name.charAt(0).toUpperCase()}
              </div>
              <div className="partner-data">
                <div className="partner-name">
                  {selectedOrder.deliveryPartner.name}
                  <span className="partner-rating">
                    ★ {selectedOrder.deliveryPartner.rating}
                  </span>
                </div>
                <div className="partner-id">ID: {selectedOrder.deliveryPartner.id}</div>
                <div className="partner-vehicle">
                  {selectedOrder.deliveryPartner.vehicleType} • {selectedOrder.deliveryPartner.vehicleNumber}
                </div>
              </div>
            </div>
            <div className="partner-contact">
              <a href={`tel:${selectedOrder.deliveryPartner.phone}`} className="call-btn">
                Call
              </a>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Show loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className="mess-order-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && orders.length === 0) {
    return (
      <div className="mess-order-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mess-order-page">
      {/* Navigation Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container-sidebar">
            <img src={logo} alt="App Logo" className="logo-sidebar" />
          </div>
          <h2 className="sidebar-title">Orders</h2>
        </div>
        
        <div className="order-filters">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => filterOrders('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => filterOrders('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'accepted' ? 'active' : ''}`}
            onClick={() => filterOrders('accepted')}
          >
            Accepted
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'declined' ? 'active' : ''}`}
            onClick={() => filterOrders('declined')}
          >
            Declined
          </button>
        </div>
        
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>No orders found</p>
            </div>
          ) : (
            orders.map(order => (
              <div 
                key={order.id}
                className={`order-item ${order.id === selectedOrderId ? 'selected' : ''} ${order.status}`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="order-item-header">
                  <span className="order-item-id">{order.id}</span>
                  <span className={`status-badge-small status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="order-item-details">
                  <p className="customer-name">{order.customerDetails.name}</p>
                  <p className="order-time">{formatDate(order.orderTime)}</p>
                  <p className="order-amount">₹{order.orderSummary.total}</p>
                </div>
                {order.status === "pending" && (
                  <div className="order-item-timer">
                    Time left: {formatTime(timeLeft[order.id] || 0)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Panel */}
      <div className="order-panel">
        {selectedOrder ? (
          <div className="content-container">
            <div className="order-header">
              <h2 className="order-title">
                <span className={`status-badge status-${selectedOrder.status}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
                Order Request
              </h2>
              <div className="order-id">Order #{selectedOrder.id}</div>
            </div>

            {selectedOrder.status === "pending" && (
              <div className="timer-section">
                <div className="timer-box">
                  Response time remaining: {formatTime(timeLeft[selectedOrder.id] || 0)}
                </div>
              </div>
            )}

            <div className="order-content">
              <div className="customer-details">
                <h3>Customer Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedOrder.customerDetails.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedOrder.customerDetails.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{selectedOrder.customerDetails.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Order Time:</span>
                  <span className="detail-value">{formatDate(selectedOrder.orderTime)}</span>
                </div>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.orderSummary.subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (5%):</span>
                  <span>₹{selectedOrder.orderSummary.tax}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee:</span>
                  <span>₹{selectedOrder.orderSummary.deliveryFee}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Total Amount:</span>
                  <span>₹{selectedOrder.orderSummary.total}</span>
                </div>
              </div>

              {/* Delivery Partner Section */}
              {renderDeliveryPartnerSection()}

              <div className="order-items">
                <div className="items-header">Ordered Items</div>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="quantity">Qty</th>
                      <th className="price">Price</th>
                      <th className="price">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td className="quantity">{item.quantity}</td>
                        <td className="price">₹{item.price}</td>
                        <td className="price">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedOrder.status === "pending" && !showDeclineReason && (
                <div className="action-buttons">
                  <button className="accept-btn" onClick={handleAcceptOrder}>
                    Accept Order
                  </button>
                  <button className="decline-btn" onClick={handleDeclineClick}>
                    Decline Order
                  </button>
                </div>
              )}

              {showDeclineReason && (
                <>
                  <textarea
                    className="reason-textarea show"
                    placeholder="Please provide a reason for declining this order..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                  ></textarea>
                  <div className="action-buttons">
                    <button className="decline-btn" onClick={handleDeclineConfirm}>
                      Confirm Decline
                    </button>
                    <button className="accept-btn" onClick={handleCancelDecline}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
              
              {selectedOrder.status === "accepted" && selectedOrder.deliveryStatus !== "waiting" && (
                <div className="action-buttons">
                  <div className="timer-box" style={{ width: '100%', textAlign: 'center' }}>
                    Estimated Preparation Time: {selectedOrder.estimatedDeliveryTime} minutes
                  </div>
                </div>
              )}
              
              {selectedOrder.status === "declined" && selectedOrder.declineReason && (
                <div className="order-summary" style={{ borderLeft: '4px solid #e74c3c' }}>
                  <div className="summary-row">
                    <span style={{ fontWeight: 'bold' }}>Decline Reason:</span>
                    <span>{selectedOrder.declineReason}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-order-selected">
            <p>No order selected or available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessOrderPage;