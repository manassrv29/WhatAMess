import React, { useEffect, useState } from 'react';
import './GoogleDistanceDemo.css';

function getDestinationFromOrigin(origin, distanceMeters, bearingDegrees) {
  const R = 6378137;
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

const GoogleDistanceDemo = ({ onDistanceChange, onEtaChange, blackTheme }) => {
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const user = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setOrigin(user);
          setDest(getDestinationFromOrigin(user, 500, 0));
        },
        () => {
          setError('Could not get your location.');
        }
      );
    } else {
      setError('Geolocation not supported.');
    }
  }, []);

  useEffect(() => {
    if (window.google && window.google.maps && origin && dest) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [dest],
          travelMode: window.google.maps.TravelMode.WALKING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK') {
            const result = response.rows[0].elements[0];
            setDistance(result.distance.text);
            setDuration(result.duration.text);
            if (onDistanceChange) onDistanceChange(result.distance.text);
            if (onEtaChange) onEtaChange(result.duration.text);
          } else {
            setError('Could not fetch distance.');
            if (onDistanceChange) onDistanceChange('');
            if (onEtaChange) onEtaChange('');
          }
        }
      );
    }
  }, [origin, dest, onDistanceChange, onEtaChange]);

  return (
    <div className={blackTheme ? "distance-black-card" : "distance-orange-card"}>
      <div className={blackTheme ? "distance-black-title" : "distance-orange-title"}>Distance & Time</div>
      {origin && dest && (
        <>
          <div className={blackTheme ? "distance-black-row" : "distance-orange-row"}>
            <span>From: Lat {origin.lat.toFixed(6)}, Lng {origin.lng.toFixed(6)}</span>
          </div>
          <div className={blackTheme ? "distance-black-row" : "distance-orange-row"}>
            <span>To: Lat {dest.lat.toFixed(6)}, Lng {dest.lng.toFixed(6)} (Mess)</span>
          </div>
          <div className={blackTheme ? "distance-black-value" : "distance-orange-value"}>
            Distance: {distance || '...'}
          </div>
          <div className={blackTheme ? "distance-black-value" : "distance-orange-value"}>
            Estimated Time: {duration || '...'}
          </div>
        </>
      )}
      {error && <div className={blackTheme ? "distance-black-error" : "distance-orange-error"}>{error}</div>}
    </div>
  );
};

export default GoogleDistanceDemo;
