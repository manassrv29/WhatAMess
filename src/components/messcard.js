import React, { useState, useEffect } from "react";
import "./MessCard.css";
import mess1 from "./mess1.jpg";
import mess2 from "./mess2.jpg";
import mess3 from "./mess3.jpg";
import { TextField, InputAdornment, Typography, Box, Button, Card, CardContent, Grid, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const messData = [
  { 
    id: 'ufXDrd9uzHc3ErehUs3edtJzeQM2', 
    image: mess1, 
    name: "Jo Paaji", 
    rating: "4.5",
    cuisine: "North Indian",
    priceRange: "₹80-150",
    speciality: "Punjabi Thali"
  },
  { 
    id: '3',
    image: mess3, 
    name: "Sheetal Rasoi", 
    rating: "4.4",
    cuisine: "Gujarati",
    priceRange: "₹90-160",
    speciality: "Gujarati Thali"
  },
  { 
    id: '4',
    image: mess2, 
    name: "Suhani Special Mess", 
    rating: "4.9",
    cuisine: "Multi-Cuisine",
    priceRange: "₹100-180",
    speciality: "Fusion Food"
  },
  { 
    id: '5',
    image: mess1, 
    name: "Maa's Kitchen", 
    rating: "4.7",
    cuisine: "Bengali",
    priceRange: "₹85-140",
    speciality: "Bengali Fish Curry"
  },
  { 
    id: '6',
    image: mess3, 
    name: "Spice Garden", 
    rating: "4.6",
    cuisine: "South Indian",
    priceRange: "₹75-130",
    speciality: "Dosa Varieties"
  },
  { 
    id: '7',
    image: mess2, 
    name: "Himalayan Delight", 
    rating: "4.5",
    cuisine: "Himalayan",
    priceRange: "₹90-170",
    speciality: "Momos & Thukpa"
  },
  { 
    id: '8',
    image: mess1, 
    name: "Maharaja Meals", 
    rating: "4.8",
    cuisine: "Rajasthani",
    priceRange: "₹95-175",
    speciality: "Dal Baati Churma"
  }
];

const MessCard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedMess, setSelectedMess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (selectedMess) {
      fetchMenuItems(selectedMess.id);
    }
  }, [selectedMess]);

  const fetchMenuItems = async (messId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/mess/${messId}/menu`);
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleMessClick = (mess) => {
    if (mess.name === "Suhani Special Mess") {
      navigate('/mess-menu/suhani-mess');
    } else if (mess.name === "Sheetal Rasoi") {
      navigate('/mess-menu/sheetal-rasoi');
    } else {
      navigate('/mess-menu', { state: { messId: mess.id } });
    }
  };

  const handleCloseMenu = () => {
    setSelectedMess(null);
    setMenuItems([]);
  };

  const handleAddToCart = (item) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setCart([...cart, { ...item, quantity: 1 }]);
  };

  const handlePlaceOrder = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/cart', { state: { items: cart } });
  };

  const filteredMesses = messData.filter(mess => 
    mess.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mess.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mess.speciality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mess-page-container">
      <Box className="welcome-section">
        <Typography variant="h3" className="welcome-title">
          Welcome to What A Mess!
        </Typography>
        <Typography variant="h6" className="welcome-subtitle">
          Discover the best mess services around you
        </Typography>
        <TextField
          fullWidth
          placeholder="Search by mess name, cuisine, or speciality..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#FF6B35' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {selectedMess ? (
        <Box className="menu-section">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">{selectedMess.name} Menu</Typography>
            <Button variant="outlined" onClick={handleCloseMenu}>
              Back to Messes
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {menuItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {item.category}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary">
                        ₹{item.price}
                      </Typography>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleAddToCart(item)}
                      >
                        <AddShoppingCartIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" color={item.isVeg ? 'success.main' : 'error.main'}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {cart.length > 0 && (
            <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handlePlaceOrder}
                startIcon={<AddShoppingCartIcon />}
              >
                Place Order ({cart.length} items)
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <div className="mess-container">
          {filteredMesses.map((mess) => (
            <div 
              key={mess.id} 
              className="mess-card"
              onClick={() => handleMessClick(mess)}
            >
              <img src={mess.image} alt={mess.name} className="mess-card-image" />
              <div className="mess-card-content">
                <h3 className="mess-card-name">{mess.name}</h3>
                <div className="mess-card-details">
                  <span className="mess-card-rating">⭐ {mess.rating}</span>
                  <span className="mess-card-cuisine">{mess.cuisine}</span>
                  <span className="mess-card-price">{mess.priceRange}</span>
                </div>
                <p className="mess-card-speciality">Speciality: {mess.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessCard;