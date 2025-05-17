import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './utils/AuthContext';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Signup from './components/Signup';
import Cart from './components/Cart';
import Reward from './components/Reward';
import Orders from './components/Orders';
import TrackOrder from './components/TrackOrder';
import AcceptPage from './components/AcceptPage';
import MessDashboard from './components/MessDashboard.js';
import CustomerDashboard from './components/CustomerDashboard';
import AuthTest from './components/AuthTest';
import NotificationButton from './components/NotificationButton';
import MessMenu from './components/MessMenu';
import DeliveryPage from './components/DeliveryPage';
import OrderTracking from './components/OrderTracking';
import RouteMap from './components/RouteMap';
import OrderConfirmation from './components/OrderConfirmation';
import FoodRecommendationPage from './components/FoodRecommendationPage';
import Community from './components/Community';

const AppRoutes = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/" />} />
        <Route path="/cart" element={currentUser ? <Cart /> : <Navigate to="/login" />} />
        <Route path="/reward" element={currentUser ? <Reward /> : <Navigate to="/login" />} />
        <Route path="/rewards" element={currentUser ? <Reward /> : <Navigate to="/login" />} />
        <Route path="/my-rewards" element={currentUser ? <Reward /> : <Navigate to="/login" />} />
        <Route path="/orders" element={currentUser ? <Orders /> : <Navigate to="/login" />} />
        <Route path="/order-tracking/:orderId" element={currentUser ? <OrderTracking /> : <Navigate to="/login" />} />
        <Route path="/track-order/:orderId" element={currentUser ? <TrackOrder /> : <Navigate to="/login" />} />
        <Route path="/accept-order/:orderId" element={currentUser ? <AcceptPage /> : <Navigate to="/login" />} />
        <Route
          path="/mess-dashboard"
          element={
            currentUser && userRole === 'mess_owner' ? (
              <MessDashboard />
            ) : (
              <Navigate to={currentUser ? "/customer-dashboard" : "/login"} />
            )
          }
        />
        <Route
          path="/customer-dashboard"
          element={
            currentUser && userRole === 'customer' ? (
              <CustomerDashboard />
            ) : (
              <Navigate to={currentUser ? "/mess-dashboard" : "/login"} />
            )
          }
        />
        <Route path="/mess-menu/:messId?" element={<MessMenu />} />
        <Route path="/deliverypage" element={<DeliveryPage />} />
        <Route path="/test" element={<AuthTest />} />
        <Route path="/route-map" element={<RouteMap />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/recommendations" element={<FoodRecommendationPage />} />
        <Route path="/community" element={<Community />} />
      </Routes>
      <div className="notification-wrapper">
        <NotificationButton />
      </div>
    </>
  );
};

export default AppRoutes; 