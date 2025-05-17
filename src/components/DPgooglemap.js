import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from "@react-google-maps/api";
import "./DPgooglemap.css";
import logo from "../assets/logo.png";

// Google Maps default styling
const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "15px",
  border: "6px solid white",
};

// Custom map styling for a cleaner look
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

// Bangalore center coordinates
const center = { lat: 12.9716, lng: 77.5946 };

// API key from environment variable or use a placeholder that will be replaced in build
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyCKYkjyiXcqWkzrPx18hvsmVrX45SE-PRc";

const DeliveryPartnerPage = () => {
  const [mapRef, setMapRef] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState("ASSIGNED"); // ASSIGNED, PICKED_UP, ON_THE_WAY, DELIVERED
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [deliveryIssue, setDeliveryIssue] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [mapLoadError, setMapLoadError] = useState(null);

  // Load Google Maps API with error handling
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places", "directions", "geometry"],
  });

  // Handle load error
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps API loading error:", loadError);
      setMapLoadError("Failed to load Google Maps. Please check your API key and internet connection.");
    }
  }, [loadError]);

  // Mock data - in a real app, this would come from API
  useEffect(() => {
    // Simulate API call to get order details
    const fetchOrderDetails = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock order data
        const mockOrderData = {
          id: "ORD78912345",
          customerName: "Rahul Sharma",
          customerPhone: "+91 9876543210",
          customerAddress: "42B, Koramangala 5th Block, Bangalore",
          restaurantName: "Spice Garden Restaurant",
          restaurantAddress: "123 MG Road, Indiranagar, Bangalore",
          restaurantPhone: "+91 8765432109",
          items: [
            { name: "Butter Chicken", quantity: 1, price: 320 },
            { name: "Naan", quantity: 2, price: 60 },
            { name: "Pulao Rice", quantity: 1, price: 150 }
          ],
          totalAmount: 530,
          paymentMethod: "Online Payment (Completed)",
          specialInstructions: "Please include extra napkins and disposable cutlery",
          deliveryFee: 45,
          estimatedDeliveryTime: "25-30 min"
        };
        
        setOrderDetails(mockOrderData);
        setEstimatedTime(25); // in minutes
        setEarnings(mockOrderData.deliveryFee);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };
    
    fetchOrderDetails();
    
    // Set mock coordinates
    const mockRestaurantCoordinates = { lat: 12.9784, lng: 77.6408 }; // Restaurant
    const mockCustomerCoordinates = { lat: 12.9552, lng: 77.6376 }; // Customer
    const mockCurrentCoordinates = { lat: 12.9700, lng: 77.6350 }; // Delivery Partner
    
    setRestaurantLocation({
      coordinates: mockRestaurantCoordinates,
      address: "123 MG Road, Indiranagar, Bangalore"
    });
    
    setCustomerLocation({
      coordinates: mockCustomerCoordinates,
      address: "42B, Koramangala 5th Block, Bangalore"
    });
    
    setCurrentLocation({
      coordinates: mockCurrentCoordinates
    });
    
    return () => {
      // Clean up location tracking
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Initialize real-time location tracking when map is loaded
  useEffect(() => {
    if (isLoaded && mapRef && !loadError) {
      try {
        // Initialize Google Maps directions services
        const directionsServiceInstance = new window.google.maps.DirectionsService();
        setDirectionsService(directionsServiceInstance);
        
        const rendererInstance = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true, // We'll use our custom markers
          polylineOptions: {
            strokeColor: "#28a745",
            strokeWeight: 5,
            strokeOpacity: 0.8,
          }
        });
        rendererInstance.setMap(mapRef);
        setDirectionsRenderer(rendererInstance);

        // Start real location tracking if available
        if (navigator.geolocation) {
          const id = navigator.geolocation.watchPosition(
            (position) => {
              const newLocation = {
                coordinates: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                }
              };
              setCurrentLocation(newLocation);
            },
            (error) => {
              console.error("Error getting location:", error);
              // Fall back to mock location with small movements
              startMockLocationUpdates();
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
          );
          setWatchId(id);
        } else {
          // Fall back to mock location
          startMockLocationUpdates();
        }
      } catch (error) {
        console.error("Error initializing map services:", error);
        setMapLoadError("Failed to initialize map services. Please try refreshing the page.");
      }
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isLoaded, mapRef, loadError]);

  // Start mock location updates for testing
  const startMockLocationUpdates = useCallback(() => {
    const locationInterval = setInterval(() => {
      setCurrentLocation(prev => {
        if (prev && prev.coordinates) {
          // Random small movement
          const lat = prev.coordinates.lat + (Math.random() * 0.001 - 0.0005);
          const lng = prev.coordinates.lng + (Math.random() * 0.001 - 0.0005);
          return { coordinates: { lat, lng } };
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(locationInterval);
  }, []);
  
  // Calculate route when locations are set
  useEffect(() => {
    if (isLoaded && directionsService && directionsRenderer && currentLocation?.coordinates && !loadError) {
      try {
        const destination = 
          deliveryStatus === "ASSIGNED" ? restaurantLocation?.coordinates : 
          deliveryStatus === "PICKED_UP" ? customerLocation?.coordinates : null;
        
        if (destination) {
          calculateGoogleRoute(currentLocation.coordinates, destination);
        }
      } catch (error) {
        console.error("Error calculating route:", error);
      }
    }
  }, [isLoaded, currentLocation, restaurantLocation, customerLocation, deliveryStatus, directionsService, directionsRenderer, loadError]);

  // Handle map load
  const onMapLoad = useCallback((map) => {
    setMapRef(map);
  }, []);

  // Calculate route using Google Maps Directions Service
  const calculateGoogleRoute = useCallback((origin, destination) => {
    if (!directionsService) return;
    
    setIsLoadingRoute(true);
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          
          // Extract distance and duration
          const route = result.routes[0];
          const leg = route.legs[0];
          
          // Set distance and duration
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);
          
          // Extract route path for our own rendering if needed
          const routePath = route.overview_path.map(point => ({
            lat: point.lat(),
            lng: point.lng()
          }));
          setRoute(routePath);
          
          // Update estimated time
          const durationMinutes = Math.round(leg.duration.value / 60);
          setEstimatedTime(durationMinutes);
          
          // Fit map to show the entire route
          if (mapRef) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(destination);
            mapRef.fitBounds(bounds);
          }
        } else {
          console.error("Directions request failed:", status);
        }
        setIsLoadingRoute(false);
      }
    );
  }, [directionsService, directionsRenderer, mapRef]);

  // Update delivery status
  const updateDeliveryStatus = (newStatus) => {
    setDeliveryStatus(newStatus);
    setShowDeliveryOptions(false);
    
    // Update estimated time based on status
    if (newStatus === "PICKED_UP" && currentLocation?.coordinates && customerLocation?.coordinates) {
      // Recalculate route from restaurant to customer
      calculateGoogleRoute(currentLocation.coordinates, customerLocation.coordinates);
    } else if (newStatus === "DELIVERED") {
      setEstimatedTime(0);
      // Clear directions display when delivered
      if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] });
      }
    }
  };

  // Toggle delivery options
  const toggleDeliveryOptions = () => {
    setShowDeliveryOptions(!showDeliveryOptions);
  };

  // Handle reporting issue
  const handleReportIssue = () => {
    if (deliveryIssue.trim() === "") {
      alert("Please describe the issue");
      return;
    }
    
    // Here you would send the issue to the backend
    alert(`Issue reported: ${deliveryIssue}`);
    setDeliveryIssue("");
    setShowIssueModal(false);
  };

  // Recenter map to current location
  const recenterMap = () => {
    if (mapRef && currentLocation?.coordinates) {
      mapRef.panTo(currentLocation.coordinates);
      mapRef.setZoom(15);
    }
  };

  // Contact customer
  const contactCustomer = () => {
    if (orderDetails?.customerPhone) {
      alert(`Calling customer at ${orderDetails.customerPhone}`);
    }
  };

  // Contact restaurant
  const contactRestaurant = () => {
    if (orderDetails?.restaurantPhone) {
      alert(`Calling restaurant at ${orderDetails.restaurantPhone}`);
    }
  };

  // Display error message
  if (loadError || mapLoadError) {
    return (
      <div className="error-container" style={{ 
        padding: "20px", 
        margin: "20px", 
        background: "#fff", 
        borderRadius: "8px", 
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        textAlign: "center" 
      }}>
        <h2 style={{ color: "#d9534f" }}>Map Loading Error</h2>
        <p>{mapLoadError || "Error loading Google Maps. Please check your API key and internet connection."}</p>
        <p style={{ marginTop: "15px" }}>
          <button 
            style={{ 
              padding: "8px 15px", 
              background: "#F4873D", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer"
            }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        flexDirection: "column"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #F4873D",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px"
        }}></div>
        <p style={{ fontSize: "18px", color: "#555" }}>Loading maps...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      {/* Left Section - Delivery Details */}
      <div className="delivery-details">
        <div className="logo-container">
          <img src={logo} alt="App Logo" className="logo" />
        </div>

        <div className="content-container">
          <div className="delivery-header">
            <h2>Delivery Details</h2>
            <div className="delivery-badge">
              {deliveryStatus === "ASSIGNED" && <span className="badge assigned">Assigned</span>}
              {deliveryStatus === "PICKED_UP" && <span className="badge picked-up">Picked Up</span>}
              {deliveryStatus === "DELIVERED" && <span className="badge delivered">Delivered</span>}
            </div>
          </div>

          {orderDetails && (
            <div className="order-info">
              <div className="order-id">Order #{orderDetails.id}</div>
              
              <div className="info-box">
                <div className="info-title">
                  <i className="icon restaurant-icon">🍽️</i>
                  <strong>Restaurant</strong>
                </div>
                <div className="info-content">
                  <p className="place-name">{orderDetails.restaurantName}</p>
                  <p className="place-address">{orderDetails.restaurantAddress}</p>
                  <button className="action-btn" onClick={contactRestaurant}>
                    <i className="icon call-icon">📞</i> Call Restaurant
                  </button>
                </div>
              </div>

              <div className="info-box">
                <div className="info-title">
                  <i className="icon customer-icon">👤</i>
                  <strong>Customer</strong>
                </div>
                <div className="info-content">
                  <p className="place-name">{orderDetails.customerName}</p>
                  <p className="place-address">{orderDetails.customerAddress}</p>
                  <button className="action-btn" onClick={contactCustomer}>
                    <i className="icon call-icon">📞</i> Call Customer
                  </button>
                </div>
              </div>
              
              <div className="order-summary">
                <div className="summary-title">Order Summary</div>
                <div className="item-list">
                  {orderDetails.items.map((item, index) => (
                    <div className="order-item" key={index}>
                      <div className="item-name">{item.name} x{item.quantity}</div>
                      <div className="item-price">₹{item.price}</div>
                    </div>
                  ))}
                </div>
                <div className="total-amount">
                  <strong>Total:</strong> ₹{orderDetails.totalAmount}
                </div>
                <div className="payment-method">
                  <strong>Payment:</strong> {orderDetails.paymentMethod}
                </div>
                {orderDetails.specialInstructions && (
                  <div className="special-instructions">
                    <div className="instructions-label">Special Instructions:</div>
                    <div className="instructions-text">{orderDetails.specialInstructions}</div>
                  </div>
                )}
              </div>

              <div className="delivery-earnings">
                <div className="earnings-amount">₹{earnings}</div>
                <div className="earnings-label">Delivery Earnings</div>
              </div>
            </div>
          )}

          <div className="delivery-status-container">
            <button className="status-btn" onClick={toggleDeliveryOptions}>
              <span>Update Status</span>
              <span className="dropdown-arrow">{showDeliveryOptions ? "▲" : "▼"}</span>
            </button>
            
            {showDeliveryOptions && (
              <div className="status-options">
                <div 
                  className={`status-option ${deliveryStatus === "ASSIGNED" ? "active" : ""}`} 
                  onClick={() => updateDeliveryStatus("ASSIGNED")}
                >
                  Assigned
                </div>
                <div 
                  className={`status-option ${deliveryStatus === "PICKED_UP" ? "active" : ""}`} 
                  onClick={() => updateDeliveryStatus("PICKED_UP")}
                >
                  Picked Up from Restaurant
                </div>
                <div 
                  className={`status-option ${deliveryStatus === "DELIVERED" ? "active" : ""}`} 
                  onClick={() => updateDeliveryStatus("DELIVERED")}
                >
                  Delivered to Customer
                </div>
              </div>
            )}
          </div>

          <div className="delivery-actions">
            <button className="action-btn" onClick={() => setShowIssueModal(true)}>
              <i className="icon issue-icon">⚠️</i> Report Issue
            </button>
            <button className="action-btn" onClick={recenterMap}>
              <i className="icon locate-icon">📍</i> My Location
            </button>
          </div>

          {/* Estimated time display */}
          <div className="eta-display">
            <div className="eta-value">{estimatedTime ? `${estimatedTime} min` : "--"}</div>
            <div className="eta-label">
              {deliveryStatus === "ASSIGNED" ? "ETA to Restaurant" : 
               deliveryStatus === "PICKED_UP" ? "ETA to Customer" : 
               "Delivery Completed"}
            </div>
          </div>

          {/* Route details display */}
          {distance && duration && (deliveryStatus !== "DELIVERED") && (
            <div className="route-details-panel">
              <div className="route-detail">
                <div className="detail-value">{distance}</div>
                <div className="detail-label">Distance</div>
              </div>
              <div className="route-detail">
                <div className="detail-value">{duration}</div>
                <div className="detail-label">Duration</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Map */}
      <div className="map-container">
        <GoogleMap
          mapContainerClassName="google-map"
          center={center}
          zoom={14}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {/* Restaurant Marker */}
          {restaurantLocation?.coordinates && (
            <Marker
              position={restaurantLocation.coordinates}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(40, 40)
              }}
              onClick={() => setSelectedMarker("restaurant")}
            />
          )}
          
          {/* Customer Marker */}
          {customerLocation?.coordinates && (
            <Marker
              position={customerLocation.coordinates}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(40, 40)
              }}
              onClick={() => setSelectedMarker("customer")}
            />
          )}
          
          {/* Delivery Partner Marker */}
          {currentLocation?.coordinates && (
            <Marker
              position={currentLocation.coordinates}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
                animation: window.google.maps.Animation.BOUNCE
              }}
              onClick={() => setSelectedMarker("deliveryPartner")}
            />
          )}

          {/* Info Windows */}
          {selectedMarker === "restaurant" && orderDetails && (
            <InfoWindow
              position={restaurantLocation.coordinates}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="info-window">
                <h3>{orderDetails.restaurantName}</h3>
                <p>{orderDetails.restaurantAddress}</p>
                <p>📞 {orderDetails.restaurantPhone}</p>
              </div>
            </InfoWindow>
          )}

          {selectedMarker === "customer" && orderDetails && (
            <InfoWindow
              position={customerLocation.coordinates}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="info-window">
                <h3>{orderDetails.customerName}</h3>
                <p>{orderDetails.customerAddress}</p>
                <p>📞 {orderDetails.customerPhone}</p>
              </div>
            </InfoWindow>
          )}

          {selectedMarker === "deliveryPartner" && (
            <InfoWindow
              position={currentLocation.coordinates}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="info-window">
                <h3>Your Current Location</h3>
                <p>Status: {deliveryStatus}</p>
                {estimatedTime > 0 && <p>ETA: {estimatedTime} min</p>}
              </div>
            </InfoWindow>
          )}

          {/* We don't need to manually render the route as the DirectionsRenderer does it for us */}
        </GoogleMap>

        {/* Navigation button */}
        <button className="nav-button" onClick={recenterMap}>
          <i className="icon locate-icon">📍</i>
        </button>

        {/* Route info overlay */}
        {distance && duration && (deliveryStatus !== "DELIVERED") && (
          <div className="route-details">
            <div className="route-detail">
              <span className="detail-value">{distance}</span>
              <span className="detail-label">Distance</span>
            </div>
            <div className="route-detail">
              <span className="detail-value">{duration}</span>
              <span className="detail-label">Duration</span>
            </div>
          </div>
        )}
      </div>

      {/* Issue Reporting Modal */}
      {showIssueModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Report Delivery Issue</h3>
              <button className="close-btn" onClick={() => setShowIssueModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="Describe the issue you're facing..."
                value={deliveryIssue}
                onChange={(e) => setDeliveryIssue(e.target.value)}
                className="issue-textarea"
              ></textarea>
            </div>
            <div className="modal-footer">
              <button className="styled-btn cancel-btn" onClick={() => setShowIssueModal(false)}>Cancel</button>
              <button className="styled-btn report-btn" onClick={handleReportIssue}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerPage;