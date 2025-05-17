import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import useWebSocket from '../utils/UseWebSocket';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Badge,
  Divider,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  ListItemSecondaryAction,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import './MessDashboard.css';

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #FFF5EC 0%, #FFE4D4 100%)',
  position: 'relative',
  overflow: 'hidden',
});

const DashboardContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(255, 107, 53, 0.1)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const StatCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.1)',
  height: '100%',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  '& .MuiTableCell-head': {
    backgroundColor: '#FFF5EC',
    color: '#FF6B35',
    fontWeight: 600,
  },
  '& .MuiTableRow-root:last-child td': {
    borderBottom: 0,
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

const MessDashboard = () => {
  const { currentUser } = useAuth();
  const { socket, isConnected } = useWebSocket('ws://localhost:8000/ws/orders');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });

  const categories = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Beverages',
    'Desserts'
  ];

  // TODO: Clean up unused variables and ensure all useEffect dependencies are correct
  // --- CLEANUP START ---
  // 1. Remove unused 'messages' from useWebSocket destructure
  // 2. Ensure useEffect dependencies are correct

  useEffect(() => {
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      socket.on('menuUpdate', handleMenuUpdate);
      return () => {
        socket.off('menuUpdate');
      };
    }
  }, [socket, isConnected]);
  // --- CLEANUP END ---

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:8000/api/menu/owner', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMenuItems(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuUpdate = (data) => {
    if (data.messId === currentUser.uid) {
      setMenuItems(prevItems => [...prevItems, data.menuItem]);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        description: item.description,
        category: item.category
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        category: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      category: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Form Data:', formData);
      
      const token = await currentUser.getIdToken();
      console.log('Token obtained:', token ? 'Yes' : 'No');
      
      const menuItemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category.toLowerCase(), // Ensure lowercase for backend enum
        isAvailable: true // Correct field name
      };
      
      console.log('Sending data to backend:', menuItemData);
      
      if (editingItem) {
        const response = await axios.put(
          `http://localhost:8000/api/menu/${editingItem._id}`,
          menuItemData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Update response:', response.data);
      } else {
        const response = await axios.post(
          'http://localhost:8000/api/menu', // Correct endpoint
          menuItemData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Create response:', response.data);
      }

      handleCloseDialog();
      await fetchMenuItems();
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save menu item',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      await axios.delete(`http://localhost:8000/api/menu/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchMenuItems();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      await axios.put(`http://localhost:8000/api/orders/${orderId}/status`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      setSnackbar({
        open: true,
        message: `Order ${status} successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update order status',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
                          (filterStatus === 'available' && item.available) ||
                          (filterStatus === 'unavailable' && !item.available);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  if (loading && !menuItems.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageWrapper>
      <DashboardContainer maxWidth="xl">
        {/* Header with Menu and Profile */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box display="flex" alignItems="center">
            <IconButton sx={{ mr: 1 }}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Menu Section */}
          <Grid item xs={12} md={8}>
            <StyledCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" sx={{ color: '#2D3748', fontWeight: 600 }}>
                    Today's Menu
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                      backgroundColor: '#FF6B35',
                      '&:hover': { backgroundColor: '#ff8559' },
                      borderRadius: '12px',
                      px: 3,
                    }}
                  >
                    Add New Item
                  </Button>
                </Box>

                {/* Search and Filters */}
                <Box display="flex" gap={2} mb={3}>
                  <TextField
                    fullWidth
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1 }}
                  />
                  
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Filter</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      label="Filter"
                    >
                      <MenuItem value="all">All Items</MenuItem>
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="unavailable">Unavailable</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="price">Price</MenuItem>
                      <MenuItem value="newest">Newest</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <StyledTableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Available</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredMenuItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            {item.image ? (
                              <Box
                                component="img"
                                src={item.image}
                                alt={item.name}
                                sx={{
                                  width: 50,
                                  height: 50,
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                              />
                            ) : (
                              <Avatar sx={{ 
                                width: 50, 
                                height: 50, 
                                bgcolor: '#FF6B3520',
                                color: '#FF6B35'
                              }}>
                                <FastfoodIcon />
                              </Avatar>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            {item.description && (
                              <Typography variant="body2" color="text.secondary">
                                {item.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          <TableCell>
                            <Switch
                              checked={item.available}
                              onChange={(e) => {
                                const updatedItem = { ...item, available: e.target.checked };
                                setMenuItems(menuItems.map(i => 
                                  i._id === item._id ? updatedItem : i
                                ));
                              }}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#FF6B35',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#FF6B35',
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDialog(item)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                onClick={() => setConfirmDelete(item)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Orders Section */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h5" sx={{ color: '#2D3748', fontWeight: 600, mb: 3 }}>
                  New Orders
                </Typography>
                <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                  {orders.map((order) => (
                    <Card
                      key={order.id}
                      sx={{
                        mb: 2,
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(255, 107, 53, 0.1)',
                        backgroundColor: '#FFF9F5',
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Order #{order.id}
                          </Typography>
                          <Chip
                            label={order.status || 'New'}
                            size="small"
                            sx={{
                              backgroundColor: '#FF6B3510',
                              color: '#FF6B35',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Customer: {order.customerName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Items: {order.items?.length || 0}
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Box display="flex" gap={1}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleOrderStatus(order.id, 'accepted')}
                            sx={{ borderRadius: '8px', flex: 1 }}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleOrderStatus(order.id, 'rejected')}
                            sx={{ borderRadius: '8px', flex: 1 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </DashboardContainer>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#FF6B35' }}>
              <FastfoodIcon />
            </Avatar>
            <Typography variant="h6" sx={{ color: '#2D3748' }}>
              What A Mess
            </Typography>
          </Box>
          <Divider />
          <List>
            <ListItemButton>
              <ListItemIcon>
                <FastfoodIcon />
              </ListItemIcon>
              <ListItemText primary="Menu Management" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <LocalDiningIcon />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: '12px',
            minWidth: 200,
          },
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(255, 107, 53, 0.1)',
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{confirmDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDelete(null)}
            sx={{ color: '#FF6B35' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(confirmDelete._id)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Menu Item Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(255, 107, 53, 0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#FF6B35',
            borderBottom: '1px solid #FFE4D4',
            pb: 2,
          }}
        >
          {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Item Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AddPhotoAlternateIcon />}
              sx={{
                borderRadius: '12px',
                borderColor: '#FF6B35',
                color: '#FF6B35',
                '&:hover': {
                  borderColor: '#ff8559',
                  backgroundColor: 'rgba(255, 107, 53, 0.04)',
                },
              }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setFormData({ ...formData, image: URL.createObjectURL(file) });
                  }
                }}
              />
            </Button>
            {formData.image && (
              <Box mt={2} display="flex" justifyContent="center">
                <img
                  src={formData.image}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #FFE4D4' }}>
          <Button
            onClick={handleCloseDialog}
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
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor: '#FF6B35',
              '&:hover': { backgroundColor: '#ff8559' },
              borderRadius: '12px',
              px: 3,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              editingItem ? 'Update' : 'Add Item'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default MessDashboard; 