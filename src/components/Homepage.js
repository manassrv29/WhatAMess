import React, { useState } from 'react';
import MessCard from './messcard';
import WomenMode from './WomenMode';
import VegNonVegToggle from './VegNonveg';
import { useNavigate } from 'react-router-dom';
import { Switch, FormControlLabel, Tooltip, Zoom, IconButton, Box } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import PeopleIcon from '@mui/icons-material/People';

const Homepage = () => {
  const [deliveryMode, setDeliveryMode] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [communityTooltipOpen, setCommunityTooltipOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = (event) => {
    setDeliveryMode(event.target.checked);
    if (event.target.checked) {
      navigate('/deliverypage');
    }
  };

  const handleRecommendationClick = () => {
    navigate('/recommendations');
  };
  
  const handleCommunityClick = () => {
    navigate('/community');
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16,
        padding: '0 16px'
      }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip
            title={
              <div style={{ 
                padding: '8px 4px', 
                fontSize: '14px', 
                fontWeight: 500,
                textAlign: 'center'
              }}>
                Swipe Your Craving
              </div>
            }
            placement="right"
            arrow
            TransitionComponent={Zoom}
            open={tooltipOpen}
            onOpen={() => setTooltipOpen(true)}
            onClose={() => setTooltipOpen(false)}
          >
            <IconButton
              onClick={handleRecommendationClick}
              onMouseEnter={() => setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: '50%',
                padding: '15px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                  backgroundColor: '#ffeb3b',
                },
                animation: 'pulse 2s infinite'
              }}
            >
              <BoltIcon 
                sx={{ 
                  fontSize: 36, 
                  color: '#f57c00',
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
                }} 
              />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={
              <div style={{ 
                padding: '8px 4px', 
                fontSize: '14px', 
                fontWeight: 500,
                textAlign: 'center'
              }}>
                Community Food Share
              </div>
            }
            placement="right"
            arrow
            TransitionComponent={Zoom}
            open={communityTooltipOpen}
            onOpen={() => setCommunityTooltipOpen(true)}
            onClose={() => setCommunityTooltipOpen(false)}
          >
            <IconButton
              onClick={handleCommunityClick}
              onMouseEnter={() => setCommunityTooltipOpen(true)}
              onMouseLeave={() => setCommunityTooltipOpen(false)}
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: '50%',
                padding: '15px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                  backgroundColor: '#1976d2',
                },
                animation: 'pulseCommunity 2s infinite'
              }}
            >
              <PeopleIcon 
                sx={{ 
                  fontSize: 36, 
                  color: '#FF6B35',
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
                }} 
              />
            </IconButton>
          </Tooltip>
        </Box>

        <FormControlLabel
          control={<Switch checked={deliveryMode} onChange={handleToggle} color="primary" sx={{ transform: 'scale(1.4)' }} />}
          label={<span style={{ fontSize: 20, fontWeight: 600 }}>Drop Ninja Mode</span>}
          sx={{ marginRight: 2 }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 24 }}>
        <VegNonVegToggle />
        <WomenMode />
      </div>
      <MessCard />

      <style jsx="true">{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
          }
        }
        
        @keyframes pulseCommunity {
          0% {
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default Homepage;