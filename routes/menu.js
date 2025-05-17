const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const verifyToken = require('../middleware/verifyToken');

// Get today's menu for a specific mess (public)
router.get('/mess/:messId', async (req, res) => {
  try {
    const { messId } = req.params;

    const menuItems = await MenuItem.find({
      messId,
      isAvailable: true
    }).sort({ category: 1 });

    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Error fetching menu' });
  }
});

// Get today's menu for the logged-in mess owner
router.get('/owner', verifyToken, async (req, res) => {
  try {
    const messId = req.user.uid;

    const menuItems = await MenuItem.find({
      messId
    }).sort({ category: 1 });

    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Error fetching menu items' });
  }
});

// Add a new menu item (dashboard uploads)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, price, description, category, isAvailable } = req.body;
    const messId = req.user.uid;

    if (!name || !price || !category) {
      console.error('[menu.js] Missing required fields:', { name, price, category });
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    if (isNaN(price) || price <= 0) {
      console.error('[menu.js] Invalid price:', price);
      return res.status(400).json({ message: 'Price must be a positive number' });
    }
    if (!['breakfast','lunch','dinner','snacks','beverages'].includes(category)) {
      console.error('[menu.js] Invalid category:', category);
      return res.status(400).json({ message: 'Invalid category. Allowed: breakfast, lunch, dinner, snacks, beverages' });
    }

    const menuItem = new MenuItem({
      name,
      price,
      description,
      category,
      messId,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      date: new Date()
    });

    await menuItem.save();

    // Emit socket event for real-time updates if using socket.io
    if (req.app.get('io')) {
      req.app.get('io').emit('menuUpdate', { messId, menuItem });
    }

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('[menu.js] Error adding menu item:', error);
    res.status(500).json({ message: 'Error adding menu item', details: error.message, stack: error.stack });
  }
});

// Update a menu item
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const messId = req.user.uid;
    const { name, price, description, category, isAvailable } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: id, messId },
      { name, price, description, category, isAvailable, updatedAt: new Date() },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Error updating menu item' });
  }
});

// Delete a menu item
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const messId = req.user.uid;

    const menuItem = await MenuItem.findOneAndDelete({ _id: id, messId });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Error deleting menu item' });
  }
});

module.exports = router;