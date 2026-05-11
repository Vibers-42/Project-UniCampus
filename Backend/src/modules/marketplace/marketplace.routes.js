const express = require('express');
const router = express.Router();
const marketplaceController = require('./marketplace.controller');
const { protect } = require('../../middleware/auth.middleware');
const { 
  createListingValidation, 
  getListingsValidation, 
  itemIDValidation,
  updateListingValidation
} = require('./marketplace.validation');

// All marketplace routes are protected (require login)
router.use(protect);

router.get('/', getListingsValidation, marketplaceController.getAllListings);
router.get('/:id', itemIDValidation, marketplaceController.getListing);
router.post('/', createListingValidation, marketplaceController.createListing);
router.put('/:id', updateListingValidation, marketplaceController.updateListing);
router.delete('/:id', itemIDValidation, marketplaceController.deleteListing);
router.patch('/:id/toggle-sold', itemIDValidation, marketplaceController.toggleSoldStatus);

module.exports = router;
