const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify
router.get('/verify', verifyToken);

module.exports = router;