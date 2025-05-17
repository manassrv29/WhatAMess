import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FoodRecommendationPage from './components/FoodRecommendationPage';
import { WebSocketProvider } from './hooks/UseWebSocket';
import { AuthProvider } from './utils/AuthContext';
import { SocketProvider } from './utils/socket';
import Routes from './Routes';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <SocketProvider>
            <WebSocketProvider>
              <div className="app-container">
                <Navbar />
                <main className="content">
                  <Routes />
                </main>
                <Footer />
              </div>
            </WebSocketProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;