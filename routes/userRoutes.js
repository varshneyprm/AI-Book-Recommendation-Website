const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// In production, you would add an auth middleware here: router.get('/dashboard', requireAuth, userController.getDashboard)
router.get('/dashboard', userController.getDashboard);

module.exports = router;