import React, { useState, useEffect, useRef } from 'react';
import './DeliveryPage.css';
import { Button, Tabs, Tab, Box } from '@mui/material';
import { getAuth } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const DeliveryPage = () => {
  const [location, setLocation] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [messNames, setMessNames] = useState({});
  const fetchingMessIds = useRef(new Set());
  const navigate = useNavigate();

  // Fetch user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(null)
      );
    }
  }, []);

  // Fetch orders from backend (replace endpoint as needed)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = user && (await user.getIdToken());
      console.log('Fetching ALL orders with token:', token);
      const url = `http://localhost:8000/api/orders/all`;
      console.log('Fetching:', url);
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log('API response:', data);
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
        console.error("API did not return an array:", data);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (location) {
      console.log('Location set:', location);
      fetchOrders();
    } else {
      console.log('Location not set');
    }
  }, [location]);

  // Fetch mess name by ID and cache it
  const fetchMessName = async (messId, token) => {
    if (!messId || messNames[messId] || fetchingMessIds.current.has(messId)) return;
    fetchingMessIds.current.add(messId);
    try {
      const res = await fetch(`http://localhost:8000/api/mess/${messId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data && data.name) {
        setMessNames(prev => ({ ...prev, [messId]: data.name }));
      }
    } catch (e) {
      // fallback: don't retry immediately
      setMessNames(prev => ({ ...prev, [messId]: 'Unknown Mess' }));
    }
  };

  // After orders are fetched, fetch missing mess names
  useEffect(() => {
    const fetchMissingNames = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = user && (await user.getIdToken());
      orders.forEach(order => {
        if ((!order.messName || order.messName === 'Unknown Mess') && order.messId) {
          fetchMessName(order.messId, token);
        }
      });
    };
    if (orders.length > 0) {
      fetchMissingNames();
    }
    // eslint-disable-next-line
  }, [orders]);

  // Dummy distance calculation (replace with real if available)
  const getDistanceString = (order) => {
    return order.distance ? `${order.distance}m away` : '50m away';
  };

  return (
    <div className="deliverypage-container">
      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ marginBottom: 3 }}>
        <Tab label="Nearby Orders" />
        {/* Future: <Tab label="My Deliveries" /> */}
      </Tabs>
      {tab === 0 && (
        <>
          <div className="deliverypage-header">
            <div className="deliverypage-actions">
              <Button variant="contained" color="primary" onClick={() => window.location.reload()}>Update Location</Button>
              <Button variant="contained" color="success" onClick={fetchOrders}>Refresh Orders</Button>
              <Button variant="contained" color="info">Map View</Button>
            </div>
            <div className="deliverypage-location">
              Your location: {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Unknown'}
            </div>
          </div>
          <div className="deliverypage-orders">
            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="no-orders">No orders found.</div>
            ) : (
              <Box display="flex" flexWrap="wrap" gap={3} justifyContent="center">
                {orders.map(order => (
                  <Box
                    key={order.orderId}
                    sx={{
                      minWidth: 340,
                      maxWidth: 400,
                      p: 3,
                      m: 1,
                      boxShadow: 3,
                      borderRadius: 3,
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Box fontWeight={700} fontSize={18} mb={1} color="#333">
                      Order #{order.orderId}
                    </Box>
                    <Box mb={1} color="#666">
                      <b>From:</b> {order.messName || messNames[order.messId] || order.messId || 'Unknown Mess'}
                    </Box>
                    <Box mb={1} color="#666">
                      <b>Mess Location:</b> {order.messLocation || 'Unknown'}
                    </Box>
                    <Box mb={1} color="#666">
                      <b>Delivery to:</b> {order.deliveryAddress}
                    </Box>
                    <Box mb={1} color="#666">
                      <b>Items:</b> {order.items?.length || 0}
                    </Box>
                    <Box mb={1} color="#666">
                      <b>Total:</b> <span style={{ color: '#1976d2', fontWeight: 600 }}>₹{order.totalAmount || '0.00'}</span>
                    </Box>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mt: 2, alignSelf: 'stretch', fontWeight: 600 }}
                      onClick={() => {
                        navigate('/route-map', {
                          state: {
                            orderUserId: order.userId, // the customer
                            orderId: order._id,
                            deliveryAddress: order.deliveryAddress
                          }
                        });
                      }}
                    >
                      Deliver
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryPage;
