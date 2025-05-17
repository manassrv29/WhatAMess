import { io } from 'socket.io-client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000', {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Authenticate socket with Firebase token
      currentUser.getIdToken().then(token => {
        newSocket.emit('authenticate', token);
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [currentUser]);

  const value = {
    socket,
    isConnected,
    emit: (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      }
    },
    on: (event, callback) => {
      if (socket) {
        socket.on(event, callback);
      }
    },
    off: (event, callback) => {
      if (socket) {
        socket.off(event, callback);
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Custom hooks for specific socket events
export const useOrderUpdates = (orderId) => {
  const { socket, isConnected } = useSocket();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;

    const handleOrderUpdate = (data) => {
      if (data.order._id === orderId) {
        setOrder(data.order);
      }
    };

    socket.on('order-update', handleOrderUpdate);

    return () => {
      socket.off('order-update', handleOrderUpdate);
    };
  }, [socket, isConnected, orderId]);

  return order;
};

export const useDeliveryLocation = (orderId) => {
  const { socket, isConnected } = useSocket();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;

    const handleLocationUpdate = (data) => {
      if (data.order._id === orderId) {
        setLocation(data.order.deliveryLocation);
      }
    };

    socket.on('delivery_location_update', handleLocationUpdate);

    return () => {
      socket.off('delivery_location_update', handleLocationUpdate);
    };
  }, [socket, isConnected, orderId]);

  return location;
};

export const useChatMessages = (orderId) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;

    const handleChatMessage = (data) => {
      if (data.orderId === orderId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    socket.on('chat_message', handleChatMessage);

    return () => {
      socket.off('chat_message', handleChatMessage);
    };
  }, [socket, isConnected, orderId]);

  return messages;
}; 