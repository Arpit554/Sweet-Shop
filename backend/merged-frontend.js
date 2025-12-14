
// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\app.js
// FILE: backend/src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sweets', require('./routes/sweetRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;

// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\config\db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;


// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\controllers\authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * REGISTER
 */
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER'
    });

    res.status(201).json({
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * LOGIN
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ IMPORTANT: return user also
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\controllers\sweetController.js
// FILE: backend/src/controllers/sweetController.js
const Sweet = require('../models/Sweet');

/**
 * Add a new sweet
 * POST /api/sweets
 */
exports.addSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    // Validation
    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        message: 'All fields are required: name, category, price, quantity'
      });
    }

    // Check if sweet with same name already exists
    const existingSweet = await Sweet.findOne({ name: { $regex: new RegExp(^${name}$, 'i') } });
    if (existingSweet) {
      return res.status(400).json({ message: 'Sweet with this name already exists' });
    }

    const sweet = await Sweet.create({
      name,
      category,
      price: Number(price),
      quantity: Number(quantity)
    });

    res.status(201).json({
      message: 'Sweet added successfully',
      sweet
    });
  } catch (error) {
    console.error('Add sweet error:', error);
    res.status(500).json({ message: 'Server error while adding sweet' });
  }
};

/**
 * Get all sweets
 * GET /api/sweets
 */
exports.getAllSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    res.json({
      count: sweets.length,
      sweets
    });
  } catch (error) {
    console.error('Get sweets error:', error);
    res.status(500).json({ message: 'Server error while fetching sweets' });
  }
};

/**
 * Search sweets by name, category, or price range
 * GET /api/sweets/search?name=xxx&category=xxx&min=0&max=100
 */
exports.searchSweets = async (req, res) => {
  try {
    const { name, category, min, max } = req.query;

    const query = {};

    // Search by name (case-insensitive partial match)
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    // Search by category (case-insensitive exact match)
    if (category) {
      query.category = { $regex: new RegExp(^${category}$, 'i') };
    }

    // Search by price range - FIX: Parse strings to numbers
    if (min !== undefined || max !== undefined) {
      query.price = {};
      if (min !== undefined && min !== '') {
        query.price.$gte = Number(min);
      }
      if (max !== undefined && max !== '') {
        query.price.$lte = Number(max);
      }
      // Remove empty price query
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    const sweets = await Sweet.find(query).sort({ name: 1 });

    res.json({
      count: sweets.length,
      query: { name, category, min, max },
      sweets
    });
  } catch (error) {
    console.error('Search sweets error:', error);
    res.status(500).json({ message: 'Server error while searching sweets' });
  }
};

/**
 * Update a sweet
 * PUT /api/sweets/:id
 */
exports.updateSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    // Check if sweet exists
    const existingSweet = await Sweet.findById(id);
    if (!existingSweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    // Check for duplicate name (excluding current sweet)
    if (name && name !== existingSweet.name) {
      const duplicateName = await Sweet.findOne({
        name: { $regex: new RegExp(^${name}$, 'i') },
        _id: { $ne: id }
      });
      if (duplicateName) {
        return res.status(400).json({ message: 'Sweet with this name already exists' });
      }
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = Number(price);
    if (quantity !== undefined) updateData.quantity = Number(quantity);

    const sweet = await Sweet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Sweet updated successfully',
      sweet
    });
  } catch (error) {
    console.error('Update sweet error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid sweet ID format' });
    }
    res.status(500).json({ message: 'Server error while updating sweet' });
  }
};

/**
 * Delete a sweet (Admin only)
 * DELETE /api/sweets/:id
 */
exports.deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    await Sweet.findByIdAndDelete(id);

    res.json({
      message: 'Sweet deleted successfully',
      deletedSweet: sweet
    });
  } catch (error) {
    console.error('Delete sweet error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid sweet ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting sweet' });
  }
};

/**
 * Purchase a sweet (decrease quantity)
 * POST /api/sweets/:id/purchase
 */
exports.purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body; // Default to 1 if not specified

    // Validate quantity
    const purchaseQty = Number(quantity);
    if (isNaN(purchaseQty) || purchaseQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    // Check stock availability
    if (sweet.quantity <= 0) {
      return res.status(400).json({ message: 'Out of stock' });
    }

    if (sweet.quantity < purchaseQty) {
      return res.status(400).json({
        message: Insufficient stock. Only ${sweet.quantity} available,
        availableQuantity: sweet.quantity
      });
    }

    // Decrease quantity
    sweet.quantity -= purchaseQty;
    await sweet.save();

    res.json({
      message: Successfully purchased ${purchaseQty} ${sweet.name}(s),
      sweet,
      purchasedQuantity: purchaseQty,
      totalCost: purchaseQty * sweet.price
    });
  } catch (error) {
    console.error('Purchase sweet error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid sweet ID format' });
    }
    res.status(500).json({ message: 'Server error while purchasing sweet' });
  }
};

/**
 * Restock a sweet (Admin only - increase quantity)
 * POST /api/sweets/:id/restock
 */
exports.restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body; // Default to 1 if not specified

    // Validate quantity
    const restockQty = Number(quantity);
    if (isNaN(restockQty) || restockQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    // Increase quantity
    sweet.quantity += restockQty;
    await sweet.save();

    res.json({
      message: Successfully restocked ${restockQty} ${sweet.name}(s),
      sweet,
      restockedQuantity: restockQty
    });
  } catch (error) {
    console.error('Restock sweet error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid sweet ID format' });
    }
    res.status(500).json({ message: 'Server error while restocking sweet' });
  }
};

// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\middlewares\adminMiddleware.js
// FILE: backend/src/middlewares/adminMiddleware.js
module.exports = (req, res, next) => {
  // Check if user exists (authMiddleware should run first)
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user is admin
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Access denied. Admin privileges required.',
      yourRole: req.user.role
    });
  }

  next();
};

// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\middlewares\authMiddleware.js
// FILE: backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid authorization format. Use: Bearer <token>' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\models\Sweet.js
// FILE: backend/src/models/Sweet.js
const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sweet name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if in stock
sweetSchema.virtual('inStock').get(function () {
  return this.quantity > 0;
});

// Index for better search performance
sweetSchema.index({ name: 'text', category: 'text' });
sweetSchema.index({ price: 1 });

module.exports = mongoose.model('Sweet', sweetSchema);

// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\models\User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);


// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\routes\authRoutes.js
const router = require('express').Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;


// FILE: C:\Users\arpit\Desktop\Sweet shop\backend\src\routes\sweetRoutes.js
// FILE: backend/src/routes/sweetRoutes.js
const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const controller = require('../controllers/sweetController');

// ============ PUBLIC/USER ROUTES (Protected - requires login) ============

// Search sweets - MUST come before /:id routes to avoid conflicts
router.get('/search', auth, controller.searchSweets);

// Get all sweets
router.get('/', auth, controller.getAllSweets);

// Purchase a sweet (any authenticated user)
router.post('/:id/purchase', auth, controller.purchaseSweet);

// ============ ADMIN ONLY ROUTES ============

// Add a new sweet (Admin only based on business logic)
router.post('/', auth, admin, controller.addSweet);

// Update a sweet (Admin only based on business logic)
router.put('/:id', auth, admin, controller.updateSweet);

// Delete a sweet (Admin only - as per requirements)
router.delete('/:id', auth, admin, controller.deleteSweet);

// Restock a sweet (Admin only - as per requirements)
router.post('/:id/restock', auth, admin, controller.restockSweet);

module.exports = router;
