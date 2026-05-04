/*
    Authentication Routing Module
    Purpose: Manages the network pathways for user onboarding, identity verification, and session termination.
    Connection: Connects the public-facing URLs to the authController logic.
*/
const express = require('express'); // Imports the Express framework
const router = express.Router(); // Initializes the routing instance
const authController = require('../controllers/authController'); // Imports the identity management functions

router.get('/register', authController.renderRegister); // Serves the HTML registration form to the client browser

router.post('/api/auth/register', authController.registerUser); // Receives the submitted registration payload and creates the account

router.get('/login', authController.renderLogin); // Serves the HTML login form to the client browser

router.post('/api/auth/login', authController.loginUser); // Receives the credential payload and issues a secure session token

router.get('/logout', authController.logoutUser); // Triggers the destruction of the active session cookie

module.exports = router; // Exports the routes to the central server configuration