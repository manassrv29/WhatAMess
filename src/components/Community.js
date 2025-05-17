import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, TextField, Card, CardMedia, CardContent, CardActions, Avatar, Grid, Rating, IconButton, Input, Chip, Divider, Paper, Container, Stack, Modal, Dialog, DialogContent, DialogTitle, useMediaQuery, useTheme, Badge, Drawer, Tab, Tabs, List, ListItem, ListItemAvatar, ListItemText, Tooltip } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SendIcon from '@mui/icons-material/Send';
import CommentIcon from '@mui/icons-material/Comment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const initialPosts = [
  {
    id: 1,
    user: 'Suhani',
    avatar: 'https://i.pravatar.cc/150?img=32',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=768&q=80',
    caption: 'Made extra Paneer Butter Masala with garlic naan! Available for dinner pickup. ₹120 for a full meal with rice.',
    rating: 4.7,
    likes: 24,
    price: 120,
    quantity: 5,
    comments: [
      { user: 'Harshit', text: 'Looks delicious! Is it spicy?' },
      { user: 'Sheetal', text: 'I had it yesterday. Highly recommended!' }
    ]
  },
  {
    id: 2,
    user: 'Sheetal',
    avatar: 'https://i.pravatar.cc/150?img=44',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=768&q=80',
    caption: 'Fresh homemade rotis available for dinner. Made with organic wheat and ghee. Pack of 4 rotis for ₹40.',
    rating: 4.9,
    likes: 18,
    price: 40,
    quantity: 10,
    comments: [
      { user: 'Ajay', text: 'Best rotis on campus!' }
    ]
  },
  {
    id: 3,
    user: 'Vikram',
    avatar: 'https://i.pravatar.cc/150?img=67',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=768&q=80',
    caption: 'Made too much Dal Makhani for my party! Can serve 6-8 people. Available for pickup tonight. ₹180 for the full pot.',
    rating: 4.5,
    likes: 14,
    price: 180,
    quantity: 2,
    comments: []
  }
];

export default function Community() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollContainerRef = useRef(null);
  
  // Load posts from localStorage or use initialPosts if nothing in storage
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('communityPosts');
    return savedPosts ? JSON.parse(savedPosts) : initialPosts;
  });
  
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  
  // Load comment cache from localStorage
  const [commentCache, setCommentCache] = useState(() => {
    const savedCommentCache = localStorage.getItem('communityCommentCache');
    return savedCommentCache ? JSON.parse(savedCommentCache) : {};
  });
  
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  
  // Load chat data from localStorage
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(() => {
    const savedUnreadMessages = localStorage.getItem('communityUnreadMessages');
    return savedUnreadMessages ? JSON.parse(savedUnreadMessages) : {};
  });
  
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem('communityChats');
    return savedChats ? JSON.parse(savedChats) : {};
  });
  
  const [chatTabValue, setChatTabValue] = useState(0);
  const chatEndRef = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('communityPosts', JSON.stringify(posts));
  }, [posts]);
  
  // Save comment cache to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('communityCommentCache', JSON.stringify(commentCache));
  }, [commentCache]);
  
  // Save chats and unread messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('communityChats', JSON.stringify(chats));
  }, [chats]);
  
  useEffect(() => {
    localStorage.setItem('communityUnreadMessages', JSON.stringify(unreadMessages));
  }, [unreadMessages]);

  // Initialize chat data if empty
  useEffect(() => {
    // Only initialize if chats object is empty
    if (Object.keys(chats).length === 0) {
      const initialChats = {};
      
      posts.forEach(post => {
        initialChats[post.user] = {
          avatar: post.avatar,
          messages: [
            { sender: post.user, text: `Hi there! Are you interested in my ${post.caption.split('!')[0]}?`, timestamp: new Date(Date.now() - 3600000).toISOString() }
          ]
        };
      });
      
      setChats(initialChats);
      
      // Set some unread message indicators if there aren't any already set
      if (Object.keys(unreadMessages).length === 0) {
        setUnreadMessages({
          'Suhani': 1,
          'Vikram': 2
        });
      }
    }
  }, []);
  
  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat, chats]);

  const handleChatOpen = () => {
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
  };

  const handleChatTabChange = (event, newValue) => {
    setChatTabValue(newValue);
  };

  const startNewChat = (user) => {
    // If chat doesn't exist, create it
    if (!chats[user]) {
      setChats({
        ...chats,
        [user]: {
          avatar: selectedPost?.avatar || '',
          messages: []
        }
      });
    }
    
    setActiveChat(user);
    
    // Mark messages as read
    if (unreadMessages[user]) {
      const updatedUnread = {...unreadMessages};
      delete updatedUnread[user];
      setUnreadMessages(updatedUnread);
    }
    
    setChatOpen(true);
    setChatTabValue(0); // Switch to direct messages tab
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !activeChat) return;
    
    const updatedChats = {...chats};
    updatedChats[activeChat].messages.push({
      sender: 'You',
      text: chatMessage,
      timestamp: new Date().toISOString()
    });
    
    setChats(updatedChats);
    setChatMessage('');
    
    // Simulate a response after a delay (only for demo)
    setTimeout(() => {
      const responseText = getRandomResponse(activeChat);
      const updatedChatsWithResponse = {...chats};
      updatedChatsWithResponse[activeChat].messages.push({
        sender: activeChat,
        text: responseText,
        timestamp: new Date().toISOString()
      });
      setChats(updatedChatsWithResponse);
    }, 1000 + Math.random() * 2000);
  };

  const getRandomResponse = (user) => {
    const responses = [
      `Yes, the food is still available!`,
      `I can deliver it within 30 minutes. Does that work?`,
      `Would you like to add any special requests?`,
      `I made it fresh just an hour ago.`,
      `It's quite popular, I only have a few portions left.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const calculateTotalUnread = () => {
    return Object.values(unreadMessages).reduce((a, b) => a + b, 0);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePost = () => {
    if (!caption) return;
    const newPost = {
      id: Date.now(),
      user: 'You',
      avatar: 'https://i.pravatar.cc/150?img=12',
      image,
      caption,
      rating: 0,
      likes: 0,
      price: price ? parseInt(price) : 0,
      quantity: quantity ? parseInt(quantity) : 1,
      comments: []
    };
    
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    
    // Save to localStorage right away
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    
    setCaption('');
    setImage(null);
    setPrice('');
    setQuantity('');
  };

  const handleComment = (postId) => {
    if (!commentCache[postId] || commentCache[postId].trim() === '') return;
    
    // Add the comment to the post
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { 
            ...post, 
            comments: [
              ...post.comments, 
              { 
                user: 'You', 
                text: commentCache[postId],
                timestamp: new Date().toISOString()
              }
            ]
          }
        : post
    );
    
    setPosts(updatedPosts);
    
    // Save to localStorage immediately
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    
    // Clear the comment input
    const updatedCommentCache = { ...commentCache, [postId]: '' };
    setCommentCache(updatedCommentCache);
    localStorage.setItem('communityCommentCache', JSON.stringify(updatedCommentCache));
    
    // If this is the currently selected post in the dialog, update it too
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prevPost => ({
        ...prevPost,
        comments: [
          ...prevPost.comments,
          { 
            user: 'You', 
            text: commentCache[postId],
            timestamp: new Date().toISOString()
          }
        ]
      }));
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handlePlaceOrder = (post) => {
    // Create order object that matches your existing architecture
    const newOrder = {
      id: `comm-${Date.now()}`,
      orderNumber: `C${Math.floor(1000 + Math.random() * 9000)}`, // Random 4-digit number
      orderStatus: 'pending',
      items: [
        {
          itemId: post.id.toString(),
          name: `${post.user}'s ${post.caption.split('!')[0]}`,
          price: post.price,
          quantity: 1,
        }
      ],
      createdAt: new Date().toISOString(),
      userId: 'current-user-id', // Replace with actual user ID if available
      messId: `community-${post.id}`,
      totalAmount: post.price,
      deliveryAddress: "Your delivery address", // Get from user profile or input
      paymentMethod: "cash", // Or other methods
    };
    
    // Store the order in localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Optional: Simulate Socket.io message
    const orderUpdate = {
      orderId: newOrder.id,
      orderStatus: 'pending',
      timestamp: new Date().toISOString()
    };
    
    // Store the order update event in localStorage for other components
    const orderUpdates = JSON.parse(localStorage.getItem('orderUpdates') || '[]');
    orderUpdates.push(orderUpdate);
    localStorage.setItem('orderUpdates', JSON.stringify(orderUpdates));
    
    // Create simple delivery location data that your map can use
    const deliveryLocation = {
      latitude: 30.268972, 
      longitude: 77.993951
    };
    localStorage.setItem(`deliveryLocation-${newOrder.id}`, JSON.stringify(deliveryLocation));
    
    // Notify user
    alert(`Order placed successfully! Your order number is ${newOrder.orderNumber}`);
    
    // Navigate to order tracking page
    navigate('/order-tracking/' + newOrder.id, { 
      state: { 
        messId: newOrder.messId,
        order: newOrder // Pass order directly for convenience
      } 
    });
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography 
          variant="h3" 
          fontWeight={700} 
          textAlign="center" 
          sx={{ 
            mb: 1,
            color: '#1A1A2E',
            background: 'linear-gradient(90deg, #FF6B35 0%, #F4A261 100%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Community Food Share
        </Typography>
        <Typography 
          variant="h6" 
          textAlign="center" 
          color="text.secondary" 
          mb={4}
          sx={{ maxWidth: '80%', mx: 'auto' }}
        >
          Share your extra food with the community or order homemade meals
        </Typography>
        
        <Paper 
          elevation={3} 
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)'
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={2} color="#1A1A2E">
            Share Your Food
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            placeholder="Describe what you've made and how much is available..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Price (₹)"
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Quantity Available"
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Input
              type="file"
              inputProps={{ accept: 'image/*' }}
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="upload-photo"
            />
            <label htmlFor="upload-photo">
              <Button 
                variant="outlined" 
                component="span"
                startIcon={<AddPhotoAlternateIcon />}
                sx={{ borderRadius: 2 }}
              >
                Add Photo
              </Button>
            </label>
            <Button 
              variant="contained" 
              onClick={handlePost}
              disabled={!caption}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(90deg, #FF6B35 0%, #F4A261 100%)',
                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #F4A261 0%, #FF6B35 100%)',
                }
              }}
            >
              Share Food
            </Button>
          </Box>
          
          {image && (
            <Box textAlign="center" mt={2}>
              <img 
                src={image} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 300, 
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </Box>
          )}
        </Paper>
      </Box>
      
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          Available Food ({posts.length})
        </Typography>
        
        {!isMobile && (
          <>
            <IconButton 
              sx={{ 
                position: 'absolute', 
                left: -20, 
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.8)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 2,
                '&:hover': { bgcolor: 'white' }
              }}
              onClick={scrollLeft}
            >
              <ArrowBackIosIcon />
            </IconButton>
            
            <IconButton 
              sx={{ 
                position: 'absolute', 
                right: -20, 
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.8)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 2,
                '&:hover': { bgcolor: 'white' }
              }}
              onClick={scrollRight}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </>
        )}
        
        <Box 
          ref={scrollContainerRef}
          sx={{ 
            display: 'flex',
            overflowX: 'auto',
            gap: 3,
            pb: 2,
            px: 1,
            scrollbarWidth: 'none',  // Firefox
            '&::-webkit-scrollbar': { display: 'none' },  // Chrome, Safari
            msOverflowStyle: 'none',  // IE, Edge
          }}
        >
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePostClick(post)}
                style={{ flex: '0 0 auto', width: isMobile ? '100%' : '350px', cursor: 'pointer' }}
              >
                <Card 
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2)',
                  }}
                >
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={post.avatar} 
                      sx={{ width: 48, height: 48, border: '2px solid #f0f0f0' }}
                    />
                    <Box>
                      <Typography fontWeight={600}>{post.user}</Typography>
                    </Box>
                  </Box>
                  
                  {post.image && (
                    <CardMedia
                      component="img"
                      height={180}
                      image={post.image}
                      alt="Food post"
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Rating
                        value={post.rating}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                      <Box display="flex" alignItems="center">
                        <ThumbUpIcon fontSize="small" sx={{ mr: 0.5, color: '#1976d2' }} />
                        <Typography variant="body2">{post.likes}</Typography>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 1, 
                        height: '4.5em', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {post.caption}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Chip 
                        label={`₹${post.price}`} 
                        color="primary" 
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                      <Chip 
                        label={`${post.quantity} available`} 
                        variant="outlined"
                        color="secondary"
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                    
                    {/* Display comments in card */}
                    {post.comments.length > 0 && (
                      <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: '#f9f9f9' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" color="text.secondary">
                            {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                          </Typography>
                          {post.comments.length > 1 && (
                            <Typography 
                              variant="body2" 
                              color="primary" 
                              sx={{ cursor: 'pointer', fontWeight: 500 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePostClick(post);
                              }}
                            >
                              View all
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Only show the most recent comment in card view */}
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {post.comments[post.comments.length-1].user.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" component="span" fontWeight={500}>
                              {post.comments[post.comments.length-1].user}:{' '}
                            </Typography>
                            <Typography variant="body2" component="span">
                              {post.comments[post.comments.length-1].text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {post.comments[post.comments.length-1].timestamp ? formatTime(post.comments[post.comments.length-1].timestamp) : "Just now"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                  
                  <Box sx={{ px: 2, pb: 2 }}>
                    {/* Comment input field */}
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Add a comment..."
                        value={commentCache[post.id] || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          setCommentCache({ ...commentCache, [post.id]: e.target.value });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            handleComment(post.id);
                          }
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComment(post.id);
                        }}
                        disabled={!commentCache[post.id] || commentCache[post.id].trim() === ''}
                        sx={{ 
                          bgcolor: '#FF6B35', 
                          color: 'white',
                          '&:hover': { bgcolor: '#F4A261' },
                          '&.Mui-disabled': { bgcolor: '#f0f0f0', color: '#bdbdbd' }
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaceOrder(post);
                      }}
                      sx={{ 
                        borderRadius: 2,
                        mr: 1,
                        background: 'linear-gradient(90deg, #FF6B35 0%, #F4A261 100%)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #F4A261 0%, #FF6B35 100%)',
                        }
                      }}
                    >
                      Order Now
                    </Button>
                  </Box>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      </Box>
      
      {/* Chat section */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Tooltip title="Chat with food sharers">
          <Badge 
            badgeContent={calculateTotalUnread()} 
            color="error" 
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <IconButton 
              onClick={handleChatOpen}
              sx={{ 
                bgcolor: '#FF6B35', 
                color: 'white', 
                width: 56, 
                height: 56,
                boxShadow: '0 4px 10px rgba(255, 107, 53, 0.4)',
                '&:hover': { bgcolor: '#F4A261' }
              }}
            >
              <ChatIcon />
            </IconButton>
          </Badge>
        </Tooltip>
      </Box>
      
      {/* Chat drawer */}
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={handleChatClose}
        sx={{
          '& .MuiDrawer-paper': { 
            width: { xs: '100%', sm: 350 }, 
            boxSizing: 'border-box',
            borderRadius: { xs: 0, sm: '12px 0 0 12px' },
            height: { xs: '100%', sm: 'calc(100% - 100px)' },
            top: { xs: 0, sm: 50 },
            boxShadow: '-5px 0 15px rgba(0,0,0,0.08)'
          },
        }}
        PaperProps={{
          component: motion.div,
          initial: { x: 350 },
          animate: { x: 0 },
          exit: { x: 350 },
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" fontWeight={600}>Messages</Typography>
          <IconButton onClick={handleChatClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={chatTabValue} onChange={handleChatTabChange} aria-label="chat tabs" variant="fullWidth">
            <Tab label="Direct Messages" />
            <Tab label="Notifications" />
          </Tabs>
        </Box>
        
        {chatTabValue === 0 && (
          <>
            {/* List of chats or active chat */}
            {!activeChat ? (
              <List sx={{ p: 0 }}>
                {Object.keys(chats).map((user) => (
                  <ListItem 
                    key={user}
                    button 
                    onClick={() => {
                      setActiveChat(user);
                      if (unreadMessages[user]) {
                        const updatedUnread = {...unreadMessages};
                        delete updatedUnread[user];
                        setUnreadMessages(updatedUnread);
                      }
                    }}
                    sx={{ 
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: unreadMessages[user] ? 'rgba(255, 107, 53, 0.08)' : 'transparent'
                    }}
                  >
                    <ListItemAvatar>
                      <Badge 
                        color="error" 
                        badgeContent={unreadMessages[user] || 0} 
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                      >
                        <Avatar src={chats[user].avatar}>{user.charAt(0)}</Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={user} 
                      secondary={chats[user].messages.length > 0 ? 
                        chats[user].messages[chats[user].messages.length - 1].text.substring(0, 30) + 
                        (chats[user].messages[chats[user].messages.length - 1].text.length > 30 ? '...' : '') 
                        : 'Start chatting'} 
                      primaryTypographyProps={{ fontWeight: unreadMessages[user] ? 700 : 400 }}
                      secondaryTypographyProps={{ fontWeight: unreadMessages[user] ? 600 : 400 }}
                    />
                    {chats[user].messages.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {formatTime(chats[user].messages[chats[user].messages.length - 1].timestamp)}
                      </Typography>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              // Active chat
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={chats[activeChat]?.avatar}>{activeChat.charAt(0)}</Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>{activeChat}</Typography>
                  <IconButton sx={{ ml: 'auto' }} onClick={() => setActiveChat(null)}>
                    <ArrowBackIosIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto', 
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  {chats[activeChat]?.messages.map((message, index) => (
                    <Box 
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.sender === 'You' ? 'flex-end' : 'flex-start',
                        maxWidth: '100%'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                        {message.sender !== 'You' && (
                          <Avatar src={chats[activeChat].avatar} sx={{ width: 32, height: 32 }}>
                            {activeChat.charAt(0)}
                          </Avatar>
                        )}
                        <Paper 
                          sx={{ 
                            p: 1.5, 
                            borderRadius: 2,
                            maxWidth: '70%',
                            backgroundColor: message.sender === 'You' ? '#FF6B35' : '#f1f1f1',
                            color: message.sender === 'You' ? 'white' : 'inherit'
                          }}
                        >
                          <Typography variant="body2">{message.text}</Typography>
                        </Paper>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Box>
                  ))}
                  <div ref={chatEndRef} />
                </Box>
                
                <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendChatMessage();
                      }
                    }}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 4,
                      } 
                    }}
                    autoFocus
                  />
                  <IconButton 
                    color="primary" 
                    onClick={sendChatMessage}
                    disabled={!chatMessage.trim()}
                    sx={{ 
                      bgcolor: '#FF6B35', 
                      color: 'white',
                      '&:hover': { bgcolor: '#F4A261' },
                      '&.Mui-disabled': { bgcolor: '#f0f0f0', color: '#bdbdbd' }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </>
        )}
        
        {chatTabValue === 1 && (
          <List sx={{ p: 0 }}>
            <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#F4A261' }}>
                  <NotificationsIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="New food available" 
                secondary="Suhani just posted Paneer Butter Masala" 
              />
              <Typography variant="caption" color="text.secondary">
                Just now
              </Typography>
            </ListItem>
            <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#F4A261' }}>
                  <NotificationsIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Order update" 
                secondary="Your order from Vikram has been accepted" 
              />
              <Typography variant="caption" color="text.secondary">
                10 min ago
              </Typography>
            </ListItem>
            <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#F4A261' }}>
                  <NotificationsIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Special offer" 
                secondary="25% off on all orders today!" 
              />
              <Typography variant="caption" color="text.secondary">
                1 hour ago
              </Typography>
            </ListItem>
          </List>
        )}
      </Drawer>
      
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, y: 20, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -20, scale: 0.9 },
          transition: { duration: 0.3 },
          sx: { 
            borderRadius: 2,
            overflow: 'hidden',
            maxHeight: '90vh'
          }
        }}
      >
        {selectedPost && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1
            }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={selectedPost.avatar} sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography variant="h6">{selectedPost.user}</Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0 }}>
              <Box>
                {selectedPost.image && (
                  <CardMedia
                    component="img"
                    height={400}
                    image={selectedPost.image}
                    alt="Food post"
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                
                <Box sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Rating
                      value={selectedPost.rating}
                      precision={0.5}
                      readOnly
                      size="medium"
                    />
                    <Box display="flex" alignItems="center">
                      <ThumbUpIcon sx={{ mr: 0.5, color: '#1976d2' }} />
                      <Typography>{selectedPost.likes} likes</Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {selectedPost.caption}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                      <Typography variant="h6" color="primary" fontWeight={600}>₹{selectedPost.price}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedPost.quantity} portions available</Typography>
                    </Box>
                    <Box>
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => {
                          handlePlaceOrder(selectedPost);
                          handleCloseDialog();
                        }}
                        sx={{ 
                          borderRadius: 2,
                          mr: 1,
                          background: 'linear-gradient(90deg, #FF6B35 0%, #F4A261 100%)',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #F4A261 0%, #FF6B35 100%)',
                          }
                        }}
                      >
                        Order Now
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ChatIcon />}
                        onClick={() => {
                          startNewChat(selectedPost.user);
                          handleCloseDialog();
                        }}
                        sx={{ borderRadius: 2 }}
                      >
                        Chat
                      </Button>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Typography variant="h6" mb={2}>Comments</Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    {selectedPost.comments.map((comment, idx) => (
                      <Box key={idx} mb={2}>
                        <Box display="flex" gap={2}>
                          <Avatar sx={{ width: 36, height: 36 }}>
                            {comment.user.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{comment.user}</Typography>
                            <Typography variant="body2">{comment.text}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {comment.timestamp ? formatTime(comment.timestamp) : "Just now"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    
                    {selectedPost.comments.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No comments yet. Be the first to comment!
                      </Typography>
                    )}
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="Add a comment..."
                      value={commentCache[selectedPost.id] || ''}
                      onChange={e => setCommentCache({ ...commentCache, [selectedPost.id]: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment(selectedPost.id);
                        }
                      }}
                    />
                    <Button 
                      variant="contained"
                      onClick={() => handleComment(selectedPost.id)}
                      disabled={!commentCache[selectedPost.id] || commentCache[selectedPost.id].trim() === ''}
                      sx={{ 
                        borderRadius: 2,
                        bgcolor: '#FF6B35',
                        '&:hover': { bgcolor: '#F4A261' },
                        '&.Mui-disabled': { bgcolor: '#f0f0f0', color: '#bdbdbd' }
                      }}
                    >
                      Comment
                    </Button>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
}
