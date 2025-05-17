import React, { useEffect, useRef, useState } from 'react';

function getDestinationFromOrigin(origin, distanceMeters, bearingDegrees) {
  // Haversine formula for destination point given distance and bearing from start point
  const R = 6378137; // Earth radius in meters
  const dByR = distanceMeters / R;
  const bearing = bearingDegrees * (Math.PI / 180);
  const lat1 = origin.lat * (Math.PI / 180);
  const lng1 = origin.lng * (Math.PI / 180);

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dByR) + Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing));
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
    Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat2)
  );
  return {
    lat: lat2 * (180 / Math.PI),
    lng: lng2 * (180 / Math.PI)
  };
}

const GoogleMapStatic = () => {
  const mapRef = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const user = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setOrigin(user);
          // Place the mess 500m north (bearing 0 degrees) from user
          setDest(getDestinationFromOrigin(user, 500, 0));
        },
        () => {
          setOrigin(null);
          setDest(null);
        }
      );
    } else {
      setOrigin(null);
      setDest(null);
    }
  }, []);

  useEffect(() => {
    if (window.google && mapRef.current && origin && dest) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: (origin.lat + dest.lat) / 2, lng: (origin.lng + dest.lng) / 2 },
        zoom: 16,
        disableDefaultUI: true,
      });

      new window.google.maps.Marker({
        position: origin,
        map,
        title: 'You',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });
      new window.google.maps.Marker({
        position: dest,
        map,
        title: 'Mess (500m North)',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
        },
      });

      // Directions Service for ROUTE
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#FF6B35',
          strokeWeight: 6,
        },
      });
      directionsService.route(
        {
          origin,
          destination: dest,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          }
        }
      );
    }
  }, [origin, dest]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '370px',
        borderRadius: '22px',
        boxShadow: '0 2px 16px #ffb34733',
      }}
    >
      {!origin && <div style={{padding: 20, color: '#FF6B35', fontWeight: 600}}>Getting your location...</div>}
    </div>
  );
};

export default GoogleMapStatic;
