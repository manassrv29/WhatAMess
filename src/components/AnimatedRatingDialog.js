import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Rating, 
  Box,
  Slide,
  Fade,
  CircularProgress
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AnimatedRatingDialog = ({ open, onClose, messName = "Sheetal Rasoi" }) => {
  const [ratings, setRatings] = useState({
    food: 0,
    service: 0,
    app: 0
  });
  const [showAverage, setShowAverage] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const calculateAverage = () => {
    const { food, service, app } = ratings;
    return ((food + service + app) / 3).toFixed(1);
  };

  const handleCalculate = () => {
    setCalculating(true);
    
    // Simulate calculation process with animation
    setTimeout(() => {
      setShowAverage(true);
      setCalculating(false);
      
      // Animate counting up to the average
      const avg = parseFloat(calculateAverage());
      let count = 0;
      const interval = setInterval(() => {
        count += 0.1;
        setAverageRating(parseFloat(count.toFixed(1)));
        
        if (count >= avg) {
          clearInterval(interval);
          setAverageRating(avg);
          
          // Show completion animation
          setTimeout(() => {
            setAnimationComplete(true);
          }, 500);
        }
      }, 100);
    }, 1500);
  };

  // Reset state when dialog is opened
  useEffect(() => {
    if (open) {
      setRatings({ food: 0, service: 0, app: 0 });
      setShowAverage(false);
      setCalculating(false);
      setAverageRating(0);
      setAnimationComplete(false);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={!calculating ? onClose : undefined}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#f8f8f8', 
        borderBottom: '1px solid #eee',
        fontWeight: 600,
        textAlign: 'center',
        py: 2
      }}>
        Rate Your Experience at {messName}
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        {showAverage ? (
          <Fade in={showAverage}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              py: 4
            }}>
              <Typography variant="h6" gutterBottom>
                Your Average Rating
              </Typography>
              
              <Box sx={{ 
                position: 'relative',
                display: 'inline-flex',
                mt: 2,
                mb: 3
              }}>
                <CircularProgress
                  variant="determinate"
                  value={averageRating * 20} // Convert to percentage (0-5 → 0-100)
                  size={120}
                  thickness={5}
                  sx={{ 
                    color: '#f57c00',
                    transition: 'all 0.5s ease'
                  }}
                />
                <Box sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Typography
                    variant="h4"
                    component="div"
                    color="text.primary"
                    sx={{ 
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {averageRating}
                    <StarIcon sx={{ 
                      ml: 0.5, 
                      color: '#f57c00',
                      fontSize: '0.8em',
                      animation: animationComplete ? 'pulse 1.5s infinite' : 'none'
                    }} />
                  </Typography>
                </Box>
              </Box>
              
              <Fade in={animationComplete}>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    textAlign: 'center',
                    maxWidth: 300,
                    mx: 'auto',
                    animation: animationComplete ? 'fadeIn 1s' : 'none'
                  }}
                >
                  Thank you for your feedback! Your ratings help us improve our service.
                </Typography>
              </Fade>
            </Box>
          </Fade>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Please rate your experience with each aspect below
            </Typography>
            
            {/* Food Quality Rating */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: '#f9f9f9'
            }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Food Quality
              </Typography>
              <Rating 
                value={ratings.food} 
                onChange={(event, newValue) => handleRatingChange('food', newValue)}
                precision={0.5}
                size="large"
              />
            </Box>
            
            {/* Service Rating */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: '#f9f9f9'
            }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Service & Delivery
              </Typography>
              <Rating 
                value={ratings.service} 
                onChange={(event, newValue) => handleRatingChange('service', newValue)}
                precision={0.5}
                size="large"
              />
            </Box>
            
            {/* App Experience Rating */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: '#f9f9f9'
            }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                App Experience
              </Typography>
              <Rating 
                value={ratings.app} 
                onChange={(event, newValue) => handleRatingChange('app', newValue)}
                precision={0.5}
                size="large"
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8f8f8', borderTop: '1px solid #eee' }}>
        {!showAverage ? (
          <>
            <Button 
              onClick={onClose} 
              color="inherit"
              disabled={calculating}
            >
              Skip
            </Button>
            <Button 
              onClick={handleCalculate} 
              variant="contained" 
              color="primary"
              disabled={calculating || (ratings.food === 0 && ratings.service === 0 && ratings.app === 0)}
            >
              {calculating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Calculating...
                </>
              ) : 'Calculate Rating'}
            </Button>
          </>
        ) : (
          <Button 
            onClick={onClose} 
            variant="contained" 
            color="primary"
            fullWidth
          >
            Close
          </Button>
        )}
      </DialogActions>
      
      <style jsx="true">{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Dialog>
  );
};

export default AnimatedRatingDialog;
