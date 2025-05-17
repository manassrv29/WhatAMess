import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const DashboardContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#FFF5EC',
  minHeight: '100vh',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(3),
}));

const HeaderTypography = styled(Typography)(({ theme }) => ({
  color: '#FF6B35',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const MessCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const CustomerDashboard = () => {
  // Mock data for available messes
  const messes = [
    {
      id: 1,
      name: 'Jo Paaji',
      image: '/mess1.jpg',
      rating: 4.5,
      cuisine: 'North Indian',
      priceRange: '₹50 - ₹100',
    },
    {
      id: 2,
      name: "Jasuja's Kitchen",
      image: '/mess2.jpg',
      rating: 4.3,
      cuisine: 'South Indian',
      priceRange: '₹60 - ₹120',
    },
    {
      id: 3,
      name: 'Sheetal Rasoi',
      image: '/mess3.jpg',
      rating: 4.7,
      cuisine: 'Gujarati',
      priceRange: '₹70 - ₹150',
    },
    {
      id: 4,
      name: 'Suhani Special Mess',
      image: '/mess4.jpg',
      rating: 4.9,
      cuisine: 'Multi-Cuisine',
      priceRange: '₹80 - ₹180',
    },
  ];

  return (
    <DashboardContainer maxWidth="xl">
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <HeaderTypography variant="h4">Find Your Mess</HeaderTypography>
              <Typography variant="subtitle1" color="textSecondary">
                Discover and order from the best messes around you
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Search Filters (to be implemented) */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Popular Messes Near You
              </Typography>
              <Grid container spacing={3}>
                {messes.map((mess) => (
                  <Grid item xs={12} sm={6} md={4} key={mess.id}>
                    <MessCard>
                      <CardMedia
                        component="img"
                        height="200"
                        image={mess.image}
                        alt={mess.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {mess.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {mess.cuisine}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Price Range: {mess.priceRange}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Rating: {mess.rating} ★
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            mt: 2,
                            backgroundColor: '#FF6B35',
                            '&:hover': { backgroundColor: '#ff8559' },
                          }}
                        >
                          View Menu
                        </Button>
                      </CardContent>
                    </MessCard>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default CustomerDashboard; 