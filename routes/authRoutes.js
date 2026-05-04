const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/register', authController.renderRegister);

router.post('/api/auth/register', authController.registerUser);

router.get('/login', authController.renderLogin);

router.post('/api/auth/login', authController.loginUser);

router.get('/logout', authController.logoutUser);

module.exports = router;