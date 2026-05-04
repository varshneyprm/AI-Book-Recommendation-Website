/*
    Telemetry Routing Module
    Purpose: Provides the secure endpoint required for the client-side Javascript to log user behavior silently in the background.
    Connection: Links the frontend tracking scripts to the interactionController while ensuring only logged-in users can submit data.
*/
const express = require('express'); // Imports the Express framework
const router = express.Router(); // Initializes the routing instance
const interactionController = require('../controllers/interactionController'); // Imports the logic for saving behavioral matrices
const { requireAuth } = require('../middleware/authMiddleware'); // Imports the session validation middleware

/*
    Data Collection Endpoint
    Forces the incoming request through the requireAuth barrier to prevent anonymous traffic from corrupting the machine learning dataset.
*/
router.post('/api/telemetry/track', requireAuth, interactionController.trackUserInteraction);

module.exports = router; // Exports the secure telemetry route