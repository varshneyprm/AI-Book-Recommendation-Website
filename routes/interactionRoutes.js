const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { requireAuth } = require('../middleware/authMiddleware');

// Telemetry endpoints should always be authenticated
router.post('/api/telemetry/track', requireAuth, interactionController.trackUserInteraction);

module.exports = router;