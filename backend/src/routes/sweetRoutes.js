const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const controller = require('../controllers/sweetController');

// ============ USER ROUTES (LOGIN REQUIRED) ============

// Search sweets
router.get('/search', auth, controller.searchSweets);

// Get all sweets
router.get('/', auth, controller.getAllSweets);

// Purchase a sweet
router.post('/:id/purchase', auth, controller.purchaseSweet);

// ============ ADMIN ROUTES ============

// Add new sweet
router.post('/', auth, admin, controller.addSweet);

// Update sweet
router.put('/:id', auth, admin, controller.updateSweet);

// Delete sweet
router.delete('/:id', auth, admin, controller.deleteSweet);

// ✅ FIXED: Restock sweet (PUT instead of POST)
router.put('/:id/restock', auth, admin, controller.restockSweet);

module.exports = router;
