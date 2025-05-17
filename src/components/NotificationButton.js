import React from 'react';
import { IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useWebSocket } from '../hooks/UseWebSocket';

const NotificationButton = () => {
  const { orders } = useWebSocket();
  const unreadOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <IconButton color="inherit" aria-label="notifications">
      <Badge badgeContent={unreadOrders} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationButton; 