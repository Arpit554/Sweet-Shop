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

    // Check if sweet with same name already exists (case-insensitive)
    const existingSweet = await Sweet.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

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
 * Search sweets
 * GET /api/sweets/search
 */
exports.searchSweets = async (req, res) => {
  try {
    const { name, category, min, max } = req.query;
    const query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (min !== undefined || max !== undefined) {
      query.price = {};
      if (min !== undefined && min !== '') query.price.$gte = Number(min);
      if (max !== undefined && max !== '') query.price.$lte = Number(max);
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    const sweets = await Sweet.find(query).sort({ name: 1 });

    res.json({
      count: sweets.length,
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

    const existingSweet = await Sweet.findById(id);
    if (!existingSweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    // Check duplicate name
    if (name && name !== existingSweet.name) {
      const duplicate = await Sweet.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });

      if (duplicate) {
        return res.status(400).json({ message: 'Sweet with this name already exists' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = Number(price);
    if (quantity !== undefined) updateData.quantity = Number(quantity);

    const sweet = await Sweet.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      message: 'Sweet updated successfully',
      sweet
    });
  } catch (error) {
    console.error('Update sweet error:', error);
    res.status(500).json({ message: 'Server error while updating sweet' });
  }
};

/**
 * Delete a sweet
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
      message: 'Sweet deleted successfully'
    });
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(500).json({ message: 'Server error while deleting sweet' });
  }
};

/**
 * Purchase a sweet
 * POST /api/sweets/:id/purchase
 */
exports.purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const purchaseQty = Number(quantity);
    if (isNaN(purchaseQty) || purchaseQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    if (sweet.quantity < purchaseQty) {
      return res.status(400).json({
        message: `Insufficient stock. Only ${sweet.quantity} available`,
        availableQuantity: sweet.quantity
      });
    }

    sweet.quantity -= purchaseQty;
    await sweet.save();

    res.json({
      message: `Successfully purchased ${purchaseQty} ${sweet.name}(s)`,
      sweet,
      totalCost: purchaseQty * sweet.price
    });
  } catch (error) {
    console.error('Purchase sweet error:', error);
    res.status(500).json({ message: 'Server error while purchasing sweet' });
  }
};

/**
 * Restock a sweet
 * POST /api/sweets/:id/restock
 */
exports.restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const restockQty = Number(quantity);
    if (isNaN(restockQty) || restockQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    sweet.quantity += restockQty;
    await sweet.save();

    res.json({
      message: `Successfully restocked ${restockQty} ${sweet.name}(s)`,
      sweet
    });
  } catch (error) {
    console.error('Restock sweet error:', error);
    res.status(500).json({ message: 'Server error while restocking sweet' });
  }
};
