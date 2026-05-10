const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the item'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please specify a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Books',
      'Calculators',
      'Lab Equipment',
      'Hostel Items',
      'Gadgets',
      'Cycles',
      'Study Materials',
      'Event Passes',
      'Other'
    ],
    default: 'Other'
  },
  condition: {
    type: String,
    required: [true, 'Please specify the item condition'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  image: {
    type: String,
    required: [true, 'Please upload at least one image']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    type: String,
    required: [true, 'Please provide contact information (Phone/Email/Telegram)']
  },
  isSold: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for search
marketplaceItemSchema.index({ title: 'text', description: 'text' });
marketplaceItemSchema.index({ category: 1 });
marketplaceItemSchema.index({ isSold: 1, isDeleted: 1 });

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
