import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../utils/AuthContext";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const socketInstance = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:8000", {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);

      // Authenticate socket with Firebase token
      currentUser.getIdToken().then(token => {
        socketInstance.emit('authenticate', token);
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socketInstance.on("message", (message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketInstance.on("order-update", (data) => {
      console.log("Received order update:", data);
      setOrders((prevOrders) => {
        const index = prevOrders.findIndex(order => order._id === data.order._id);
        if (index !== -1) {
          const newOrders = [...prevOrders];
          newOrders[index] = data.order;
          return newOrders;
        }
        return [...prevOrders, data.order];
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUser]);

  const sendMessage = useCallback(
    (message) => {
      if (socket && isConnected) {
        console.log("Sending message:", message);
        socket.emit("message", message);
      } else {
        console.error("Cannot send message: WebSocket is not connected");
      }
    },
    [socket, isConnected]
  );

  const emit = useCallback(
    (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      } else {
        console.error(`Cannot emit ${event}: WebSocket is not connected`);
      }
    },
    [socket, isConnected]
  );

  const value = {
    socket,
    isConnected,
    messages,
    orders,
    sendMessage,
    emit,
    on: (event, callback) => socket?.on(event, callback),
    off: (event, callback) => socket?.off(event, callback)
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Custom hooks for specific socket events
export const useOrderUpdates = (orderId) => {
  const { socket, isConnected, orders } = useWebSocket();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;

    // Set initial order state from orders array
    const existingOrder = orders.find(o => o._id === orderId);
    if (existingOrder) {
      setOrder(existingOrder);
    }

    const handleOrderUpdate = (data) => {
      if (data.order._id === orderId) {
        setOrder(data.order);
      }
    };

    socket.on('order-update', handleOrderUpdate);

    return () => {
      socket.off('order-update', handleOrderUpdate);
    };
  }, [socket, isConnected, orderId, orders]);

  return order;
};

export const useDeliveryLocation = (orderId) => {
  const { socket, isConnected } = useWebSocket();
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
  const { socket, isConnected } = useWebSocket();
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