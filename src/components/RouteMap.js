import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';

// IMPORTANT: Replace with your Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyCKYkjyiXcqWkzrPx18hvsmVrX45SE-PRc';

const RouteMap = () => {
  const mapRef = useRef();
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { orderUserId, orderId, deliveryAddress } = location.state || {};
  const [userLocation, setUserLocation] = useState(null); // your location
  const [customerLocation, setCustomerLocation] = useState(null); // delivery user

  console.log('RouteMap: userLocation:', userLocation);
  console.log('RouteMap: customerLocation:', customerLocation);
  console.log('RouteMap: orderUserId:', orderUserId);
  console.log('RouteMap: orderId:', orderId);
  console.log('RouteMap: deliveryAddress:', deliveryAddress);

  // STATIC: Replace with your current location for testing (within 500m)
  const STATIC_CUSTOMER_LOCATION = { lat: 30.268972, lng: 77.993951 }; // Example: near your location

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setCustomerLocation(STATIC_CUSTOMER_LOCATION);
          setLoading(false); // Set loading to false when ready
        },
        (err) => {
          alert('Could not get your current location. Using fallback.');
          setUserLocation({ lat: 30.2687, lng: 77.9935 }); // fallback for testing
          setCustomerLocation(STATIC_CUSTOMER_LOCATION);
          setLoading(false);
        }
      );
    } else {
      setUserLocation({ lat: 30.2687, lng: 77.9935 }); // fallback for testing
      setCustomerLocation(STATIC_CUSTOMER_LOCATION);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLocation || !customerLocation) return;
    // Only add the script if it hasn't been added yet
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => {
        initMap();
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else {
      initMap();
    }

    function initMap() {
      const mapDiv = document.getElementById('route-map');
      if (!mapDiv) return;
      const map = new window.google.maps.Map(mapDiv, {
        center: userLocation,
        zoom: 16,
      });
      mapRef.current = map;
      // Markers
      new window.google.maps.Marker({
        position: userLocation,
        map,
        label: 'U',
        title: 'Your Location',
      });
      new window.google.maps.Marker({
        position: customerLocation,
        map,
        label: 'C',
        title: 'Customer Location',
      });
      // Directions
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);
      directionsService.route(
        {
          origin: userLocation,
          destination: customerLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const leg = result.routes[0].legs[0];
            setEta(leg.duration.text);
          } else {
            setEta('N/A');
          }
        }
      );
    }
  }, [userLocation, customerLocation]);

  if (loading) {
    return <div style={{ padding: 24 }}><b>Loading map...</b></div>;
  }

  return (
    <Box p={3}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <Typography variant="h5" mb={2}>Route to Customer</Typography>
      <Typography mb={1}><b>Delivery Address:</b> {deliveryAddress}</Typography>
      <Typography mb={2}><b>Expected Time of Arrival:</b> {eta || 'N/A'}</Typography>
      <div id="route-map" style={{ height: 400, width: '100%', borderRadius: 8, boxShadow: '0 2px 10px #0001' }}></div>
    </Box>
  );
};

export default RouteMap;
