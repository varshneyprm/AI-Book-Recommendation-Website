/*
    User Profile Routing Module
    Purpose: Defines the pathways for users to access their personal data and targeted recommendations.
    Connection: Connects the browser URL to the userController responsible for aggregating profile metrics.
*/
const express = require('express'); // Imports the Express framework
const router = express.Router(); // Initializes the routing instance
const userController = require('../controllers/userController'); // Imports the data aggregation logic for the profile hub

router.get('/dashboard', userController.getDashboard); // Serves the personalized hub interface

module.exports = router; // Exports the dashboard route