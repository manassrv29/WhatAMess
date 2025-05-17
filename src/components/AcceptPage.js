import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, LoadScript } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useOrderUpdates, useDeliveryLocation, useWebSocket } from '../hooks/UseWebSocket';
import "./AcceptPage.css";
import logo from "./WhatAMess 2.png";
import { Paper, Typography, Box, Chip, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

// Google Maps configuration
const mapContainerStyle = {
  height: "85%",
  width: "85%",
  borderRadius: "15px"
};

const libraries = ["places"];
const center = { lat: 12.9716, lng: 77.5946 }; // Bangalore

const AcceptPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, isConnected } = useWebSocket();
  const { orderId } = location.state || {};

  // Map loading and reference
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCKYkjyiXcqWkzrPx18hvsmVrX45SE-PRc", // Replace with your API key
    libraries
  });
  
  const mapRef = useRef(null);
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  
  // State management
  const [orderDetails, setOrderDetails] = useState(null);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [fromCoordinates, setFromCoordinates] = useState(null);
  const [toCoordinates, setToCoordinates] = useState(null);
  const [directions, setDirections] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setOrderDetails(response.data);
        setFromLocation(response.data.messAddress);
        setToLocation(response.data.deliveryAddress);
        
        // Automatically search locations when data is loaded
        handleLocationSearch(response.data.messAddress, response.data.deliveryAddress);
        
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
      socket.emit('join_delivery_room', { orderId });

      socket.on('order_status_update', (data) => {
        if (data.orderId === orderId) {
          setOrderDetails(prev => ({ ...prev, ...data }));
        }
      });

      socket.on('customer_location_update', (data) => {
        if (data.orderId === orderId) {
          setToLocation(data.newAddress);
          handleLocationSearch(null, data.newAddress);
        }
      });

      return () => {
        socket.emit('leave_delivery_room', { orderId });
        socket.off('order_status_update');
        socket.off('customer_location_update');
      };
    }
  }, [socket, isConnected, orderId]);

  // Get user's current location
  useEffect(() => {
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

  const handleLocationSearch = async (from, to) => {
    if (!isLoaded || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    
    if (from) {
      try {
        const results = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: from }, (results, status) => {
            if (status === "OK" && results[0]) {
              resolve(results);
            } else {
              reject(new Error("Location not found"));
            }
          });
        });

        const location = results[0].geometry.location;
        const coordinates = { lat: location.lat(), lng: location.lng() };
        setFromCoordinates(coordinates);
        setFromLocation(results[0].formatted_address);
      } catch (error) {
        console.error("Error geocoding from location:", error);
      }
    }

    if (to) {
      try {
        const results = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: to }, (results, status) => {
            if (status === "OK" && results[0]) {
              resolve(results);
            } else {
              reject(new Error("Location not found"));
            }
          });
        });

        const location = results[0].geometry.location;
        const coordinates = { lat: location.lat(), lng: location.lng() };
        setToCoordinates(coordinates);
        setToLocation(results[0].formatted_address);
      } catch (error) {
        console.error("Error geocoding to location:", error);
      }
    }

    // Calculate route if both coordinates are available
    if (fromCoordinates && toCoordinates) {
      calculateRoute();
    }
  };

  const onMapLoad = (map) => {
    setMapInstance(map);
    mapRef.current = map;
  };

  const calculateRoute = () => {
    if (!fromCoordinates || !toCoordinates || !isLoaded) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: fromCoordinates,
        destination: toCoordinates,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
            distanceValue: leg.distance.value,
            durationValue: leg.duration.value
          });

          // Update order status with ETA
          if (socket && isConnected) {
            socket.emit('update_delivery_eta', {
              orderId,
              eta: leg.duration.text
            });
          }
          
          if (mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(fromCoordinates);
            bounds.extend(toCoordinates);
            mapRef.current.fitBounds(bounds);
          }
        }
      }
    );
  };

  const handleStartDelivery = async () => {
    try {
      await axios.post(`http://localhost:5000/api/orders/${orderId}/start-delivery`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (socket && isConnected) {
        socket.emit('delivery_started', {
          orderId,
          deliveryPartnerLocation: userLocation
        });
      }

      // Start sending location updates
      startLocationUpdates();
    } catch (error) {
      console.error('Error starting delivery:', error);
    }
  };

  const startLocationUpdates = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          if (socket && isConnected) {
            socket.emit('update_delivery_location', {
              orderId,
              location
            });
          }
        },
        (error) => {
          console.error("Error tracking location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      // Store watchId for cleanup
      return () => navigator.geolocation.clearWatch(watchId);
    }
  };

  // Render error or loading state
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  if (loading) return <div>Loading order details...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="accept-page">
      {/* Left Section - Order Details */}
      <div className="accept-details">
        <div className="logo-container">
          <img src={logo} alt="App Logo" className="logo" />
        </div>

        <div className="content-container">
          <h2>Delivery Details</h2>

          {orderDetails && (
            <div className="order-box">
              <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
              <p><strong>Customer:</strong> {orderDetails.customerName}</p>
              <p><strong>Contact:</strong> {orderDetails.customerPhone}</p>
              <p><strong>Items:</strong></p>
              <ul>
                {orderDetails.items.map((item, index) => (
                  <li key={index}>
                    {item.name} x {item.quantity}
                  </li>
                ))}
              </ul>
              <p><strong>Total Amount:</strong> ₹{orderDetails.totalAmount}</p>
              <p><strong>Payment Mode:</strong> {orderDetails.paymentMode}</p>
            </div>
          )}

          <div className="info">
            <strong>From:</strong>
            <input
              type="text"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="location-input"
              ref={originRef}
              readOnly
            />
          </div>

          <div className="info">
            <strong>To:</strong>
            <input
              type="text"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="location-input"
              ref={destinationRef}
              readOnly
            />
          </div>

          {routeInfo && (
            <div className="route-info-box">
              <div className="info-row">
                <span className="info-label">Distance:</span>
                <span className="info-value">{routeInfo.distance}</span>
              </div>
              <div className="info-row">
                <span className="info-label">ETA:</span>
                <span className="info-value">{routeInfo.duration}</span>
              </div>
            </div>
          )}

          <button 
            className="accept-btn styled-btn" 
            onClick={handleStartDelivery}
            disabled={!directions}
          >
            Start Delivery
          </button>
        </div>
      </div>

      {/* Right Section - Map */}
      <div className="map-container">
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            onLoad={onMapLoad}
            options={{
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true
            }}
          >
            {/* Marker for user's current location */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                }}
                title="Your Location"
              />
            )}
            
            {/* Marker for pickup location */}
            {fromCoordinates && (
              <Marker
                position={fromCoordinates}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                }}
                title="Pickup Location"
              />
            )}
            
            {/* Marker for destination location */}
            {toCoordinates && (
              <Marker
                position={toCoordinates}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                }}
                title="Destination"
              />
            )}
            
            {/* Directions renderer */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: "#ff7e5f",
                    strokeWeight: 5
                  }
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
        
        {/* Floating buttons for map controls */}
        <div className="map-controls">
          <button 
            className="styled-btn location-btn"
            onClick={() => {
              if (userLocation && mapRef.current) {
                mapRef.current.panTo(userLocation);
                mapRef.current.setZoom(16);
              }
            }}
            title="Go to my location"
          >
            📍
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptPage;