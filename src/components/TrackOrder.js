import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Autocomplete } from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import { useWebSocket } from '../hooks/UseWebSocket';
import axios from "axios";
import "./TrackOrder.css";
import logo from "./WhatAMess 2.png";

// Map container style
const mapContainerStyle = {
  height: "85%",
  width: "85%",
  borderRadius: "15px"
};

// Bangalore center coordinates
const center = {
  lat: 12.9716,
  lng: 77.5946
};

// Map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true
};

// Google Maps API libraries to load
const libraries = ["places"];

// API key from environment variables
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyCKYkjyiXcqWkzrPx18hvsmVrX45SE-PRc";

const TrackOrder = () => {
  const location = useLocation();
  const { socket, isConnected } = useWebSocket();
  const { orderId } = location.state || {};

  // State for order details
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for map and route
  const [mapRef, setMapRef] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [deliveryPartnerLocation, setDeliveryPartnerLocation] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState("");

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrderDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (socket && isConnected && orderId) {
      // Join a specific room for this order to receive updates
      // Backend should implement room-based messaging for this order
      socket.emit('join_tracking_room', { orderId });

      // Listen for delivery partner location updates
      // Backend should emit this event when delivery partner location changes
      // Expected payload: { orderId: string, location: { lat: number, lng: number } }
      socket.on('delivery_location_update', (data) => {
        if (data.orderId === orderId) {
          setDeliveryPartnerLocation(data.location);
          updateRoute(data.location);
        }
      });

      // Listen for order status updates
      // Backend should emit this event when order status changes
      // Expected payload: { orderId: string, orderStatus: string, ...otherOrderDetails }
      socket.on('order_status_update', (data) => {
        if (data.orderId === orderId) {
          setOrderDetails(prev => ({ ...prev, ...data }));
        }
      });

      // Listen for estimated delivery time updates
      // Backend should emit this event when ETA changes
      // Expected payload: { orderId: string, eta: string }
      socket.on('delivery_eta_update', (data) => {
        if (data.orderId === orderId) {
          setEstimatedTime(data.eta);
        }
      });

      // Cleanup function to leave room and remove listeners
      return () => {
        socket.emit('leave_tracking_room', { orderId });
        socket.off('delivery_location_update');
        socket.off('order_status_update');
        socket.off('delivery_eta_update');
      };
    }
  }, [socket, isConnected, orderId]);

  // Update route when delivery partner location changes
  const updateRoute = (deliveryLocation) => {
    if (!orderDetails || !deliveryLocation) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: deliveryLocation,
        destination: orderDetails.deliveryAddress,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text
          });
        }
      }
    );
  };

  // Load the map
  const onMapLoad = (map) => {
    setMapRef(map);
  };

  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    // Get user's current location or use default coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location if geolocation fails
          setCenter({ lat: 20.5937, lng: 78.9629 }); // Default to India's center
        }
      );
    }
  }, []);

  const mapStyles = {
    height: "400px",
    width: "100%"
  };

  if (loading) return <div>Loading order details...</div>;
  if (error) return <div>{error}</div>;
  if (!orderDetails) return <div>No order details found</div>;

  return (
    <div className="order-page">
      {/* Left Section - Order Details */}
      <div className="order-details">
        <div className="logo-container">
          <img src={logo} alt="App Logo" className="logo" />
        </div>

        <div className="content-container">
          <h2>Track Your Order</h2>

          <div className="order-box">
            <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
            <p><strong>Status:</strong> {orderDetails.orderStatus}</p>
            <p><strong>Estimated Delivery:</strong> {estimatedTime || "Calculating..."}</p>
            <p><strong>Items:</strong></p>
            <ul>
              {orderDetails.items.map((item, index) => (
                <li key={index}>
                  {item.name} x {item.quantity}
                </li>
              ))}
            </ul>
            <p><strong>Total Amount:</strong> ₹{orderDetails.totalAmount}</p>
          </div>

          {routeInfo && (
            <div className="route-info">
              <p><strong>Distance:</strong> {routeInfo.distance}</p>
              <p><strong>Time:</strong> {routeInfo.duration}</p>
            </div>
          )}

          <div className="delivery-status">
            <h3>Delivery Status</h3>
            <div className="status-timeline">
              <div className={`status-step ${orderDetails.orderStatus === "Order Placed" ? "active" : ""}`}>
                <span className="step-number">1</span>
                <span className="step-text">Order Placed</span>
              </div>
              <div className={`status-step ${orderDetails.orderStatus === "Preparing" ? "active" : ""}`}>
                <span className="step-number">2</span>
                <span className="step-text">Preparing</span>
              </div>
              <div className={`status-step ${orderDetails.orderStatus === "On the Way" ? "active" : ""}`}>
                <span className="step-number">3</span>
                <span className="step-text">On the Way</span>
              </div>
              <div className={`status-step ${orderDetails.orderStatus === "Delivered" ? "active" : ""}`}>
                <span className="step-number">4</span>
                <span className="step-text">Delivered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Map */}
      <div className="map-container">
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={13}
            center={center}
          >
            {directions && <DirectionsRenderer directions={directions} />}
            <Marker position={center} />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default TrackOrder;