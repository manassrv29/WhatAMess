import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrderUpdates, useDeliveryLocation, useChatMessages, useSocket } from '../utils/socket';
import { Paper, Typography, Box, Chip, TextField, Button, CircularProgress, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GoogleMapReact from 'google-map-react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const StatusChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(1),
  '&.pending': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  '&.preparing': {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
  },
  '&.ready': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  '&.delivered': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.dark,
  },
}));

const Marker = ({ text }) => <div style={{ color: 'red', fontWeight: 'bold' }}>{text}</div>;

const OrderTracking = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { socket, isConnected, emit } = useSocket();
  const order = useOrderUpdates(orderId);
  const deliveryLocation = useDeliveryLocation(orderId);
  const messages = useChatMessages(orderId);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [messCoords, setMessCoords] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [messId, setMessId] = useState(location.state?.messId);

  useEffect(() => {
    if (!messId && order && order.messId) {
      setMessId(order.messId);
    }
  }, [order, messId]);

  useEffect(() => {
    if (!order) return;
    setLoading(false);
  }, [order]);

  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const token = localStorage.getItem('token');
        const userProfile = await axios.get('http://localhost:8000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userProfile.data && userProfile.data.location && userProfile.data.location.lat && userProfile.data.location.lng) {
          setUserCoords({ lat: userProfile.data.location.lat, lng: userProfile.data.location.lng });
        } else {
          setMapError('User location not set.');
        }
        if (messId) {
          const messRes = await axios.get(`http://localhost:8000/api/mess/${messId}`);
          if (messRes.data && messRes.data.location && Array.isArray(messRes.data.location.coordinates)) {
            setMessCoords({ lat: messRes.data.location.coordinates[1], lng: messRes.data.location.coordinates[0] });
          } else {
            setMapError('Mess location not set.');
          }
        }
      } catch (err) {
        setMapError('Failed to fetch user or mess location.');
      }
    };
    if (messId) fetchCoords();
  }, [messId]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket && isConnected) {
      emit('chat-message', {
        orderId,
        message: newMessage.trim()
      });
      setNewMessage('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'preparing':
        return 'preparing';
      case 'ready':
        return 'ready';
      case 'delivered':
        return 'delivered';
      default:
        return 'default';
    }
  };

  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6" color="error">
          Order not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">
            Order #{order.orderNumber}
          </Typography>
          <StatusChip
            label={order.orderStatus}
            className={getStatusColor(order.orderStatus)}
          />
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <AccessTimeIcon sx={{ mr: 1 }} />
          <Typography>
            Ordered at: {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <LocationOnIcon sx={{ mr: 1 }} />
          <Typography>
            Delivery to: {order.deliveryAddress}
          </Typography>
        </Box>

        {deliveryLocation && (
          <Box display="flex" alignItems="center" mb={2}>
            <LocalShippingIcon sx={{ mr: 1 }} />
            <Typography>
              Delivery Partner Location: {deliveryLocation.latitude}, {deliveryLocation.longitude}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" mb={2}>
          Order Route
        </Typography>
        {mapError && <Typography color="error">{mapError}</Typography>}
        {userCoords && messCoords && (
          <div style={{ height: '300px', width: '100%' }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
              defaultCenter={userCoords}
              defaultZoom={13}
            >
              <Marker lat={userCoords.lat} lng={userCoords.lng} text="You" />
              <Marker lat={messCoords.lat} lng={messCoords.lng} text="Mess" />
            </GoogleMapReact>
          </div>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" mb={2}>
          Order Items
        </Typography>
        {order.items.map((item, index) => (
          <Box key={index} display="flex" justifyContent="space-between" mb={1}>
            <Typography>{item.name}</Typography>
            <Typography>x {item.quantity}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" mb={2}>
          Chat with Delivery Partner
        </Typography>
        <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                p: 1,
                mb: 1,
                borderRadius: 1,
                bgcolor: 'background.default'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
              <Typography>{message.message}</Typography>
            </Box>
          ))}
        </Box>

        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderTracking;