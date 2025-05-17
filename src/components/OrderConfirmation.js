import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Button from '@mui/material/Button';
import AnimatedRatingDialog from './AnimatedRatingDialog';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, messName = "Sheetal Rasoi" } = location.state || {};
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    // Show rating dialog after 20 seconds
    const timer = setTimeout(() => {
      setShowRating(true);
    }, 20000); // 20 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleCloseRating = () => {
    setShowRating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
      <CheckCircleIcon style={{ color: '#4caf50', fontSize: 100 }} />
      <h1>Order Placed Successfully!</h1>
      <p>Your order ID is <b>{orderId}</b>.</p>
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: 24 }}
        onClick={() => navigate('/route-map', { state: { orderId } })}
      >
        Track Order
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        style={{ marginTop: 12 }}
        onClick={() => navigate('/')}
      >
        Back to Home
      </Button>

      {/* Animated Rating Dialog */}
      <AnimatedRatingDialog 
        open={showRating}
        onClose={handleCloseRating}
        messName={messName}
      />
    </div>
  );
};

export default OrderConfirmation;
