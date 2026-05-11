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
      'Electronics',
      'Books',
      'Lab Equipment',
      'Stationery',
      'Hostel Essentials',
      'Gadgets',
      'Cycles',
      'Furniture',
      'Study Materials',
      'Event Passes',
      'Calculators',
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
  negotiable: {
    type: Boolean,
    default: false
  },
  department: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Please upload at least one image']
  },
  // ADDED: Cloudinary public_id for main image — needed for cleanup on delete
  imagePublicId: {
    type: String,
    default: ''
  },
  attachments: [{
    url:       { type: String, required: true },
    publicId:  { type: String, default: '' },
    fileType:  { type: String, default: '' },
  }],
  tags: [{
    type: String,
    trim: true
  }],
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
marketplaceItemSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text', 
  location: 'text', 
  department: 'text' 
});
marketplaceItemSchema.index({ category: 1 });
marketplaceItemSchema.index({ isSold: 1, isDeleted: 1 });
// ADDED: Compound index for "My Posts" query pattern
marketplaceItemSchema.index({ sellerId: 1, createdAt: -1 });

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
