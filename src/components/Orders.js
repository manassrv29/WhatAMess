import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Axios for HTTP requests
import "./Orders.css"; // Import custom styles

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State to manage the currently active tab: "current" or "history"
  const [activeTab, setActiveTab] = useState("current");

  // State to store fetched previous orders from the backend
  const [orderHistory, setOrderHistory] = useState([]);

  // State to handle loading indication during API request
  const [isLoading, setIsLoading] = useState(true);

  // State to handle any errors that occur during API request
  const [error, setError] = useState(null);

  // Get current order details from location state
  const orderDetails = location.state || {
    messName: "",
    items: [],
    totalAmount: 0,
    deliveryAddress: "",
    paymentMode: "Cash on Delivery",
    deliveryInstructions: "",
    orderStatus: "",
    estimatedTime: ""
  };

  // Fetch order history from backend
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8000/api/orders/history', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrderHistory(response.data.orders);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('Failed to load order history');
        setIsLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  // Handler to navigate to the Track Order page
  const handleTrackOrder = (orderId) => {
    navigate("/track-order", { state: { orderId, ...orderDetails } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="orders-container">
      {/* Tab navigation buttons */}
      <div className="tab-buttons">
        <button
          className={activeTab === "current" ? "active" : ""}
          onClick={() => setActiveTab("current")}
        >
          Current Order
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          Order History
        </button>
      </div>

      {/* ======= Current Order Section ======= */}
      {activeTab === "current" && orderDetails.messName && (
        <div className="order-card">
          <h2>{orderDetails.messName}</h2>
          <p><b>Order Placed: {formatDate(orderDetails.orderDate || new Date())}</b></p>
          <p>Estimated Delivery: {orderDetails.estimatedTime}</p>
          <p>{orderDetails.deliveryAddress}</p>
          <p><b>Status: {orderDetails.orderStatus}</b></p>

          {/* Order Items List */}
          <h3>Order Items</h3>
          <ul>
            {orderDetails.items.map((item, index) => (
              <li key={index} className="order-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <p>{item.quantity}x {item.name}</p>
                  <p>₹{item.price}</p>
                </div>
              </li>
            ))}
          </ul>

          <h3>Total: ₹{orderDetails.totalAmount}</h3>

          {/* Track Order Button */}
          <button className="track-order-btn" onClick={() => handleTrackOrder(orderDetails.orderId)}>
            Track Order ➜
          </button>
        </div>
      )}

      {/* ======= Order History Section ======= */}
      {activeTab === "history" && (
        <div className="order-history">
          {isLoading ? (
            <div className="loading-skeleton">Loading order history...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : orderHistory.length === 0 ? (
            <div className="no-orders">No previous orders found</div>
          ) : (
            orderHistory.map((order) => (
              <div key={order.orderId} className="order-card historical">
                <div className="order-header">
                  <h2>{order.messName}</h2>
                  <span className="order-status">{order.orderStatus}</span>
                </div>
                <p className="order-date">{formatDate(order.orderDate)}</p>
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.image} alt={item.name} className="item-image" />
                      <div className="item-details">
                        <p>{item.quantity}x {item.name}</p>
                        <p>₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <p className="total-amount">Total: ₹{order.totalAmount}</p>
                  {order.orderStatus === "Delivered" && (
                    <button className="reorder-btn" onClick={() => navigate(`/mess-menu/${order.messId}`)}>
                      Order Again
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
