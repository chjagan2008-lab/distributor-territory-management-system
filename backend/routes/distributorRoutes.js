const express = require('express');
const router = express.Router();
const {
  createDistributor,
  getAllDistributors,
  updateDistributor,
  deleteDistributor
} = require('../controllers/distributorController');

// GET all distributors
router.get('/', getAllDistributors);

// POST create new distributor
router.post('/', createDistributor);

// PUT update distributor by id
router.put('/:id', updateDistributor);

// DELETE distributor by id
router.delete('/:id', deleteDistributor);

module.exports = router;