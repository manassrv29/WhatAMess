import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  FormHelperText,
  Avatar,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import logo from '../components/WhatAMess.png';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #FFF5EC 0%, #FFE4D4 100%)',
  position: 'relative',
  overflow: 'hidden',
});

const BackgroundLogo = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '800px',
  height: '800px',
  opacity: 0.04,
  backgroundImage: `url(${logo})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  filter: 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.3))',
});

const LoginContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  position: 'relative',
  zIndex: 1,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 450,
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(255, 107, 53, 0.1)',
  backdropFilter: 'blur(8px)',
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  marginTop: '80px',
}));

const LogoContainer = styled(Box)({
  width: '200px',
  height: '200px',
  margin: '-100px auto 24px',
  padding: '32px',
  background: '#fff',
  borderRadius: '50%',
  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transform: 'scale(1.2)',
  },
});

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2.5),
  borderRadius: '12px',
  border: '2px solid #FFE4D4',
  '&.Mui-selected': {
    backgroundColor: '#FF6B35',
    color: 'white',
    '&:hover': {
      backgroundColor: '#ff8559',
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 107, 53, 0.04)',
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '&:hover fieldset': {
      borderColor: '#FF6B35',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FF6B35',
    },
  },
});

const Login = () => {
  const navigate = useNavigate();
  const { login, signup, currentUser, userRole } = useAuth();
  const [userType, setUserType] = useState('customer');
  const [openDialog, setOpenDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    messName: '',
    address: '',
    gender: '',
    messDescription: '',
    cuisine: '',
    isVeg: true,
    isWomenOnly: false,
    openingStart: '',
    openingEnd: '',
    images: '',
    messLocation: undefined, // Will hold { lng, lat }
  });

  const roleMap = {
    customer: 'user',
    mess: 'mess_owner',
    delivery: 'delivery_partner'
  };

  const validateForm = (data, isSignup = false) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isSignup) {
      if (!data.name) {
        errors.name = 'Name is required';
      }

      if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (userType === 'mess') {
        if (!data.messName) {
          errors.messName = 'Mess name is required';
        }
        if (!data.address) {
          errors.address = 'Address is required';
        }
        if (!data.messDescription) {
          errors.messDescription = 'Mess description required';
        }
        if (!data.openingStart || !data.openingEnd) {
          errors.openingHours = 'Opening hours required';
        }
      }

      if (!data.gender) {
        errors.gender = 'Please select your gender';
      }
    }

    return errors;
  };

  // Helper for geolocation error
  const handleGeoError = (error) => {
    let message = 'Unable to fetch location.';
    if (error.code === 1) message = 'Location permission denied. Please allow location access.';
    else if (error.code === 2) message = 'Location unavailable.';
    else if (error.code === 3) message = 'Location request timed out.';
    alert(message); // Or use a snackbar if you have one
    console.error('[FRONTEND] Geolocation error:', error);
  };

  // Utility to get geolocation, returns a Promise
  const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return reject(new Error('Geolocation not supported'));
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('[FRONTEND] Got user location:', coords);
          resolve(coords);
        },
        (error) => {
          handleGeoError(error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formErrors = validateForm(loginData);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Store the current userType in a local variable to ensure it doesn't change during async operations
    const currentUserType = userType;
    console.log("Login attempt with userType (captured):", currentUserType);

    setLoading(true);
    try {
      let userLocation;
      try {
        userLocation = await getCurrentLocation();
      } catch (locErr) {
        // Optional: Show a warning, but do not block login
        console.warn('[FRONTEND] Location fetch failed during login:', locErr);
        userLocation = undefined;
      }
      console.log('[FRONTEND] Location to be sent on login:', userLocation);
      const result = await login(loginData.email, loginData.password);
      const firebaseUser = result.user || result; // Adjust if your AuthContext returns user differently

      // 2. Get Firebase token
      const token = await firebaseUser.getIdToken();

      // 3. Register user in MongoDB (idempotent: will not duplicate)
      const registerResponse = await axios.post('http://localhost:8000/api/auth/register', {
        name: firebaseUser.displayName || loginData.email.split('@')[0],
        email: loginData.email,
        role: roleMap[currentUserType], // Use the captured userType
        location: userLocation
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('[FRONTEND] Register response:', registerResponse.data);

      // Also update location on login
      const loginUpdateResp = await axios.post('http://localhost:8000/api/auth/login', {
        email: loginData.email,
        password: loginData.password,
        location: userLocation
      });
      console.log('[FRONTEND] Login update response:', loginUpdateResp.data);

      // NEW: Wait for userRole to be available if not already
      let finalRole = result.role;
      if (!finalRole && typeof userRole !== 'undefined') {
        // Try to get userRole from context if not present in result
        let attempts = 0;
        const maxAttempts = 15;
        while (!finalRole && attempts < maxAttempts) {
          await new Promise(res => setTimeout(res, 100));
          finalRole = userRole;
          attempts++;
        }
      }

      // Show a loading spinner/message while waiting for role
      if (!finalRole) {
        setSnackbar({ open: true, message: 'Logging in... determining your role', severity: 'info' });
      }

      // FORCE REDIRECT: If user selected 'mess' type, always go to mess dashboard
      if (roleMap[currentUserType] === 'mess_owner' || finalRole === 'mess_owner') {
        // Use window.location for a hard redirect that bypasses React Router
        window.location.href = '/mess-dashboard';
        return;
      }

      // 5. Continue with role-based navigation logic from backend
      if (finalRole === 'mess_owner') {
        navigate('/mess-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Login error:", error);
      setSnackbar({
        open: true,
        message: error.message || 'Login failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setErrors({});
    setOpenDialog(true);
    if (userType === 'mess') {
      setLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setSignupData((prev) => ({
              ...prev,
              messLocation: {
                lng: position.coords.longitude,
                lat: position.coords.latitude,
              },
            }));
            setLoading(false);
          },
          (error) => {
            setSnackbar({ open: true, message: 'Failed to get location: ' + error.message, severity: 'error' });
            setLoading(false);
          }
        );
      } else {
        setSnackbar({ open: true, message: 'Geolocation is not supported by your browser.', severity: 'error' });
        setLoading(false);
      }
    }
  };

  const handleSignup = async () => {
    const formErrors = validateForm(signupData, true);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    let userLocation;
    try {
      userLocation = await getCurrentLocation();
      console.log('[FRONTEND] Location to be sent on signup:', userLocation);
    } catch (locErr) {
      setSnackbar({ open: true, message: 'Failed to get location: ' + locErr.message, severity: 'error' });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Create user in Firebase
      const firebaseUser = await signup(signupData.email, signupData.password);
      // 2. Register user in MongoDB after Firebase signup
      const token = await firebaseUser.getIdToken();
      if (userType === 'mess') {
        console.log('SignupData for mess owner:', signupData);
        const messPayload = {
          name: signupData.name,
          email: signupData.email,
          role: roleMap[userType], // Always use 'user' for normal users in payloads
          phone: signupData.phone,
          address: signupData.address,
          gender: signupData.gender,
          messName: signupData.messName,
          messDescription: signupData.messDescription,
          messAddress: signupData.address,
          messLocation: { type: 'Point', coordinates: [signupData.messLocation.lng, signupData.messLocation.lat] },
          cuisine: signupData.cuisine ? signupData.cuisine.split(',').map(s => s.trim()) : [],
          isVeg: signupData.isVeg,
          isWomenOnly: signupData.isWomenOnly,
          openingHours: { start: signupData.openingStart, end: signupData.openingEnd },
          images: signupData.images ? signupData.images.split(',').map(s => s.trim()) : [],
          location: userLocation
        };
        console.log('[FRONTEND] Payload to be sent to /register (mess):', messPayload);
        await axios.post('http://localhost:8000/api/auth/register', messPayload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        const userPayload = {
          name: signupData.name,
          email: signupData.email,
          role: roleMap[userType], // Always use 'user' for normal users in payloads
          phone: signupData.phone,
          address: signupData.address,
          gender: signupData.gender,
          messName: signupData.messName,
          messDescription: signupData.messDescription,
          messAddress: signupData.address,
          messLocation: (userType === 'mess' && signupData.messLocation)
            ? { type: 'Point', coordinates: [signupData.messLocation.lng, signupData.messLocation.lat] }
            : undefined,
          cuisine: signupData.cuisine ? signupData.cuisine.split(',').map(s => s.trim()) : [],
          isVeg: signupData.isVeg,
          isWomenOnly: signupData.isWomenOnly,
          openingHours: { start: signupData.openingStart, end: signupData.openingEnd },
          images: signupData.images ? signupData.images.split(',').map(s => s.trim()) : [],
          location: userLocation
        };
        console.log('[FRONTEND] Payload to be sent to /register (non-mess):', userPayload);
        await axios.post('http://localhost:8000/api/auth/register', userPayload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      // 3. Automatically log the user in after signup
      try {
        await handleLoginAfterSignup(signupData.email, signupData.password);
        setSnackbar({
          open: true,
          message: 'Account created and logged in! Redirecting...',
          severity: 'success'
        });
      } catch (loginError) {
        setSnackbar({
          open: true,
          message: 'Signup succeeded, but auto-login failed. Please login manually.',
          severity: 'warning'
        });
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Signup error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Signup failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAfterSignup = async (email, password) => {
    // Capture the current userType to ensure it doesn't change during async operations
    const currentUserType = userType;
    console.log("Handling login after signup with userType (captured):", currentUserType);
    
    const user = await login(email, password);
    
    // FORCE REDIRECT: If user selected 'mess' type, always go to mess dashboard
    if (roleMap[currentUserType] === 'mess_owner') {
      console.log("FORCE REDIRECTING to mess dashboard after signup (based on form selection)");
      // Use window.location for a hard redirect that bypasses React Router
      window.location.href = '/mess-dashboard';
      return;
    }
    
    // Wait for userRole to be set
    let attempts = 0;
    const maxAttempts = 10;
    while (!userRole && attempts < maxAttempts) {
      await new Promise(res => setTimeout(res, 100));
      attempts++;
    }
    
    console.log("After waiting, userRole is:", userRole);
    
    if (roleMap[currentUserType] === 'mess_owner') {
      console.log("Redirecting to mess dashboard based on role");
      window.location.href = '/mess-dashboard';
    } else {
      console.log("Redirecting to home page");
      window.location.href = '/';
    }
  };

  const handleUserTypeChange = (event, newUserType) => {
    if (newUserType !== null) {
      setUserType(newUserType);
      setErrors({});
    }
  };



  return (
    <PageWrapper>
      <BackgroundLogo />
      <LoginContainer maxWidth="xl">
        <StyledCard>
          <CardContent sx={{ p: 4, pt: 0 }}>
            <LogoContainer>
              <img src={logo} alt="What A Mess" />
            </LogoContainer>

            <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: 600, color: '#2D3748' }}>
              Welcome to What A Mess
            </Typography>

            <Box sx={{ mb: 4 }}>
              <ToggleButtonGroup
                value={userType}
                exclusive
                onChange={handleUserTypeChange}
                fullWidth
                sx={{ mb: 3, gap: 2 }}
              >
                <StyledToggleButton value="customer">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 32 }} />
                    <Typography>Customer</Typography>
                  </Box>
                </StyledToggleButton>
                <StyledToggleButton value="mess">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <RestaurantIcon sx={{ fontSize: 32 }} />
                    <Typography>Mess Owner</Typography>
                  </Box>
                </StyledToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box component="form" onSubmit={handleLogin}>
              <StyledTextField
                fullWidth
                label="Email"
                type="email"
                value={loginData.email}
                onChange={(e) => {
                  setLoginData({ ...loginData, email: e.target.value });
                  setErrors({ ...errors, email: '' });
                }}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
              />
              <StyledTextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => {
                  setLoginData({ ...loginData, password: e.target.value });
                  setErrors({ ...errors, password: '' });
                }}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#FF6B35',
                  '&:hover': { backgroundColor: '#ff8559' },
                  mb: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleOpenDialog}
                disabled={loading}
                sx={{
                  color: '#FF6B35',
                  borderColor: '#FF6B35',
                  '&:hover': {
                    borderColor: '#ff8559',
                    backgroundColor: 'rgba(255, 107, 53, 0.04)',
                  },
                  borderRadius: '12px',
                  py: 1.5,
                }}
              >
                Create New Account
              </Button>
            </Box>
          </CardContent>
        </StyledCard>
      </LoginContainer>

      {/* Enhanced Signup Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !loading && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(255, 107, 53, 0.1)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#FF6B35',
          borderBottom: '1px solid #FFE4D4',
          pb: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Avatar 
            src={logo} 
            sx={{ 
              width: 40, 
              height: 40,
              boxShadow: '0 2px 8px rgba(255, 107, 53, 0.2)',
            }} 
          />
          Sign Up as {userType === 'mess' ? 'Mess Owner' : 'Customer'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2 }}>
            <StyledTextField
              fullWidth
              label="Name"
              value={signupData.name}
              onChange={(e) => {
                setSignupData({ ...signupData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />

            {/* Gender Selection */}
            <FormControl 
              component="fieldset" 
              error={!!errors.gender}
              sx={{ mb: 2, width: '100%' }}
            >
              <FormLabel 
                component="legend" 
                sx={{ 
                  color: '#2D3748', 
                  '&.Mui-focused': { color: '#FF6B35' } 
                }}
              >
                Gender
              </FormLabel>
              <RadioGroup
                row
                value={signupData.gender}
                onChange={(e) => {
                  setSignupData({ ...signupData, gender: e.target.value });
                  setErrors({ ...errors, gender: '' });
                }}
              >
                <FormControlLabel 
                  value="male" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': { color: '#FF6B35' }
                      }}
                    />
                  } 
                  label="Male" 
                />
                <FormControlLabel 
                  value="female" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': { color: '#FF6B35' }
                      }}
                    />
                  } 
                  label="Female" 
                />
                <FormControlLabel 
                  value="other" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': { color: '#FF6B35' }
                      }}
                    />
                  } 
                  label="Other" 
                />
              </RadioGroup>
              {errors.gender && (
                <FormHelperText error>{errors.gender}</FormHelperText>
              )}
            </FormControl>

            {userType === 'mess' && (
              <>
                <StyledTextField
                  fullWidth
                  label="Mess Name"
                  value={signupData.messName}
                  onChange={(e) => {
                    setSignupData({ ...signupData, messName: e.target.value });
                    setErrors({ ...errors, messName: '' });
                  }}
                  error={!!errors.messName}
                  helperText={errors.messName}
                  sx={{ mb: 2 }}
                />
                <StyledTextField
                  fullWidth
                  label="Mess Description"
                  value={signupData.messDescription}
                  onChange={e => setSignupData({ ...signupData, messDescription: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <StyledTextField
                  fullWidth
                  label="Cuisine (comma separated)"
                  value={signupData.cuisine}
                  onChange={e => setSignupData({ ...signupData, cuisine: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={<Radio checked={signupData.isVeg} onChange={() => setSignupData({ ...signupData, isVeg: true })} />}
                  label="Veg"
                />
                <FormControlLabel
                  control={<Radio checked={!signupData.isVeg} onChange={() => setSignupData({ ...signupData, isVeg: false })} />}
                  label="Non-Veg"
                />
                <FormControlLabel
                  control={<Radio checked={signupData.isWomenOnly} onChange={() => setSignupData({ ...signupData, isWomenOnly: !signupData.isWomenOnly })} />}
                  label="Women Only Mess"
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <StyledTextField
                    fullWidth
                    label="Opening Start (e.g. 08:00)"
                    value={signupData.openingStart}
                    onChange={e => setSignupData({ ...signupData, openingStart: e.target.value })}
                  />
                  <StyledTextField
                    fullWidth
                    label="Opening End (e.g. 22:00)"
                    value={signupData.openingEnd}
                    onChange={e => setSignupData({ ...signupData, openingEnd: e.target.value })}
                  />
                </Box>
                <StyledTextField
                  fullWidth
                  label="Image URLs (comma separated)"
                  value={signupData.images}
                  onChange={e => setSignupData({ ...signupData, images: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </>
            )}
            <StyledTextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={signupData.address}
              onChange={(e) => {
                setSignupData({ ...signupData, address: e.target.value });
                setErrors({ ...errors, address: '' });
              }}
              error={!!errors.address}
              helperText={errors.address}
              sx={{ mb: 2 }}
            />
            <StyledTextField
              fullWidth
              label="Email"
              type="email"
              value={signupData.email}
              onChange={(e) => {
                setSignupData({ ...signupData, email: e.target.value });
                setErrors({ ...errors, email: '' });
              }}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
            />
            <StyledTextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={signupData.password}
              onChange={(e) => {
                setSignupData({ ...signupData, password: e.target.value });
                setErrors({ ...errors, password: '' });
              }}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <StyledTextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={signupData.confirmPassword}
              onChange={(e) => {
                setSignupData({ ...signupData, confirmPassword: e.target.value });
                setErrors({ ...errors, confirmPassword: '' });
              }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #FFE4D4' }}>
          <Button 
            onClick={() => !loading && setOpenDialog(false)}
            disabled={loading}
            sx={{
              color: '#FF6B35',
              '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.04)' },
              borderRadius: '12px',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSignup}
            disabled={loading}
            sx={{
              backgroundColor: '#FF6B35',
              '&:hover': { backgroundColor: '#ff8559' },
              borderRadius: '12px',
              px: 3,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default Login;
