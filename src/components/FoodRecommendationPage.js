import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  Slide,
  Fade,
  Paper,
  Chip,
  Grow,
  Stack,
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

// --- DYNAMIC DATA GENERATION ---
// Map dish names to their specific local images as requested
const localFoodImages = {
  'Rajma Rice': require('./Rajma-08-728x1092.webp'),
  'Chole Bhature': require('./mess1.jpg'),
  'Veg Pulao': require('./pulav.webp'),
  'Dal Makhani': require('./Dal-Makhani.webp'),
  'Gulab Jamun': require('./gulab jamun.webp'),
  'Paneer Butter Masala': require('./mess3.jpg'),
  'Aloo Paratha': require('./aloo-paratha.webp'),
  'Sambar Rice': require('./sambhar rice.webp'),
  'Dahi Bhalla': require('./dahi bhalla.webp'),
  'Rasgulla': require('./rasgulla.webp'),
  'Paneer Tikka': require('./paneertikka.jpg'),
  'Gajar Halwa': require('./gajarkahalwa.jpg'),
};

function getFoodImgUrl(name) {
  // Prefer local image if available, else fallback to Unsplash
  if (localFoodImages[name]) {
    return localFoodImages[name];
  }
  const query = encodeURIComponent(name + ' indian food');
  const unique = Math.floor(Math.random() * 100000);
  return `https://source.unsplash.com/300x200/?${query}&sig=${unique}`;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomUserName() {
  const names = ['Ankit', 'Priya', 'Rahul', 'Suhani', 'Aman', 'Sneha', 'Rohit', 'Megha', 'Karan', 'Simran'];
  return getRandomElement(names);
}

function getRandomRecommendations() {
  // Pick two unique random dishes for all sections
  const allDishes = [
    { id: 1, name: 'Rajma Rice', desc: 'Classic rajma with fluffy rice' },
    { id: 2, name: 'Chole Bhature', desc: 'Spicy chickpeas with fluffy bhature' },
    { id: 3, name: 'Veg Pulao', desc: 'Aromatic rice with mixed vegetables' },
    { id: 4, name: 'Dal Makhani', desc: 'Rich and creamy black lentils' },
    { id: 5, name: 'Gulab Jamun', desc: 'Soft and syrupy dessert' },
    { id: 6, name: 'Paneer Butter Masala', desc: 'Creamy paneer in rich tomato gravy' },
    { id: 7, name: 'Aloo Paratha', desc: 'Stuffed flatbread with potato' },
    { id: 8, name: 'Sambar Rice', desc: 'South Indian style rice with sambar' },
    { id: 9, name: 'Dahi Bhalla', desc: 'Soft lentil dumplings in yogurt' },
    { id: 10, name: 'Rasgulla', desc: 'Spongy syrupy Bengali dessert' },
  ];
  let shuffled = allDishes.sort(() => 0.5 - Math.random());
  let picked = shuffled.slice(0, 2);
  return picked.map(dish => ({ ...dish, img: getFoodImgUrl(dish.name) }));
}

function getRandomRegularlyOrdered() {
  const messes = ['Suhani Special', 'Campus Mess', 'North Mess', 'South Mess'];
  // Use the same two dishes everywhere
  const twoDishes = getRandomRecommendations();
  return [
    {
      mess: getRandomElement(messes),
      items: twoDishes,
    },
  ];
}

function getRandomThrowback() {
  const allDishes = [
    { id: 11, name: 'Chole Bhature', desc: 'Spicy chickpeas with fluffy bhature' },
    { id: 12, name: 'Paneer Tikka', desc: 'Grilled paneer cubes with spices' },
    { id: 13, name: 'Gajar Halwa', desc: 'Carrot pudding dessert' },
  ];
  const dish = getRandomElement(allDishes);
  const daysAgo = Math.floor(Math.random() * 15) + 3;
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    ...dish,
    img: getFoodImgUrl(dish.name),
    orderedDate: date.toISOString().slice(0, 10),
  };
}

// --- END DYNAMIC DATA GENERATION ---

const styles = {
  container: {
    padding: '30px 0',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: '20px',
    color: '#2c3e50',
    textAlign: 'center',
    position: 'relative',
    paddingBottom: '10px',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80px',
      height: '3px',
      backgroundColor: '#2ecc40',
    }
  },
  section: {
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    height: '100%',
    transition: 'transform 0.3s, box-shadow 0.3s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    }
  },
  foodImage: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
    background: '#eee',
  },
  foodName: {
    fontWeight: 700,
    fontSize: '1.2rem',
    marginBottom: '8px',
    color: '#2c3e50',
    textAlign: 'center',
  },
  foodDesc: {
    color: '#7f8c8d',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  messTitle: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'inline-block',
    fontWeight: 600,
    marginBottom: '20px',
  }
};

export default function FoodRecommendationPage() {
  // Generate dynamic data on mount
  const [userName, setUserName] = useState('');
  const [regularlyOrdered, setRegularlyOrdered] = useState([]);
  const [recommendationsToday, setRecommendationsToday] = useState([]);
  const [tastyThrowback, setTastyThrowback] = useState(null);

  useEffect(() => {
    setUserName(getRandomUserName());
    setRegularlyOrdered(getRandomRegularlyOrdered());
    setRecommendationsToday(getRandomRecommendations());
    setTastyThrowback(getRandomThrowback());
  }, []);

  const [showRegular, setShowRegular] = useState(false);
  const [showToday, setShowToday] = useState(false);
  const [showThrowback, setShowThrowback] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowRegular(true), 300);
    setTimeout(() => setShowToday(true), 900);
    setTimeout(() => setShowThrowback(true), 1500);
  }, []);

  // Defensive: Don't render until all data is ready
  if (!tastyThrowback || !recommendationsToday.length || !regularlyOrdered.length) {
    return <Box sx={{ textAlign: 'center', mt: 10 }}><Typography>Loading recommendations...</Typography></Box>;
  }

  return (
    <Box sx={styles.container}>
      <Container maxWidth="lg">
        {/* Header */}
        <Grow in={true} timeout={900}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#2c3e50', mb: 2 }}>
              Food Recommendations
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#7f8c8d', mb: 4 }}>
              Discover your favorites and explore new flavors
            </Typography>
          </Box>
        </Grow>

        {/* Today's Recommendations */}
        <Fade in={showToday} timeout={1000}>
          <Paper sx={styles.section}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              Today's Recommendations
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={4} 
                justifyContent="center"
                alignItems="stretch"
              >
                {recommendationsToday.map((item, idx) => (
                  item && item.img && (
                    <Grow 
                      in={showToday} 
                      style={{ transitionDelay: `${idx * 200}ms` }} 
                      key={item.id}
                    >
                      <Paper sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={styles.card}>
                          <img src={item.img} alt={item.name} style={styles.foodImage} />
                          <Typography sx={styles.foodName}>
                            {item.name}
                          </Typography>
                          <Typography sx={styles.foodDesc}>
                            {item.desc}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grow>
                  )
                ))}
              </Stack>
            </Box>
          </Paper>
        </Fade>

        {/* Regularly Ordered */}
        <Fade in={showRegular} timeout={1000}>
          <Paper sx={{ ...styles.section, mt: 5 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              Your Regular Favorites
            </Typography>
            {regularlyOrdered.map((mess) => (
              <Box key={mess.mess} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Typography sx={styles.messTitle}>
                    <RestaurantMenuIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.2rem' }} />
                    {mess.mess}
                  </Typography>
                </Box>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={4} 
                  justifyContent="center"
                  alignItems="stretch"
                >
                  {mess.items.map((item) => (
                    item && item.img && (
                      <Grow in={showRegular} key={item.id} style={{ flex: 1, minWidth: 0 }}>
                        <Paper sx={{ height: '100%' }}>
                          <Box sx={styles.card}>
                            <img src={item.img} alt={item.name} style={styles.foodImage} />
                            <Typography sx={styles.foodName}>
                              {item.name}
                            </Typography>
                            <Typography sx={styles.foodDesc}>
                              {item.desc}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grow>
                    )
                  ))}
                </Stack>
              </Box>
            ))}
          </Paper>
        </Fade>

        {/* Tasty Throwback */}
        <Fade in={showThrowback} timeout={1000}>
          <Paper sx={{ ...styles.section, mt: 5 }}>
            <Typography variant="h5" sx={styles.sectionTitle}>
              Tasty Throwback
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Paper elevation={3} sx={{ maxWidth: 500, width: '100%' }}>
                <Box sx={styles.card}>
                  {tastyThrowback && tastyThrowback.img && (
                    <img src={tastyThrowback.img} alt={tastyThrowback.name} style={styles.foodImage} />
                  )}
                  <Typography sx={styles.foodName}>
                    {tastyThrowback.name}
                  </Typography>
                  <Typography sx={styles.foodDesc}>
                    {tastyThrowback.desc}
                  </Typography>
                  <Typography sx={{ mt: 2, color: '#95a5a6', fontSize: '0.8rem' }}>
                    Ordered on: {tastyThrowback.orderedDate}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
