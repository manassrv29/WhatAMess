const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user' // Default role if not specified
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.code === 'auth/invalid-credential') {
      return res.status(401).json({ 
        message: 'Invalid authentication credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { verifyToken }; 