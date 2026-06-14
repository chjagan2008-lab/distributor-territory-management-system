const express = require('express');
const router = express.Router();
const { createDistributor, getAllDistributors } = require('../controllers/distributorController');

// POST /api/distributors - Create new record
router.post('/', createDistributor);

// GET /api/distributors - Get all records
router.get('/', getAllDistributors);

module.exports = router;