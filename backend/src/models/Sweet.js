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