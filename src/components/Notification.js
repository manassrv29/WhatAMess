import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./NotificationButton.css";

const Notification = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Update this URL to your actual backend URL
        const response = await fetch('http://localhost:8000/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any authentication headers if required
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || 'Failed to fetch orders');
        }

        const data = await response.json();
        // Ensure the data is in the correct format
        const formattedOrders = Array.isArray(data) ? data : [];
        setOrders(formattedOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Unable to load orders. Please try again later.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchOrders();

    // Set up polling interval (e.g., every 30 seconds)
    const interval = setInterval(fetchOrders, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleResponse = async (id, response) => {
    try {
      // Update this URL to your actual backend URL
      const apiResponse = await fetch(`http://localhost:8000/api/orders/${id}/${response}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if required
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to update order status');
      }

      if (response === "accepted") {
        navigate("/accept", { 
          state: { 
            orderId: id,
            // You can add more order details here if needed
          } 
        });
      } else {
        // Show a more user-friendly notification instead of alert
        setError(`Order ${response} successfully`);
        setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
      }
      
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="notification-container">
      <button className="notification-btn" onClick={toggleNotifications}>
        <FaBell className="icon" />
        {orders.length > 0 && <span className="badge">{orders.length}</span>}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <h4>New Orders</h4>
          {loading ? (
            <p>Loading orders...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="notification-item">
                <p>📍 Order near {order.location} ({order.distance})</p>
                <button
                  className="accept"
                  onClick={() => handleResponse(order.id, "accepted")}
                  disabled={loading}
                >
                  Accept
                </button>
                <button
                  className="decline"
                  onClick={() => handleResponse(order.id, "declined")}
                  disabled={loading}
                >
                  Decline
                </button>
              </div>
            ))
          ) : (
            <p>No new requests</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
