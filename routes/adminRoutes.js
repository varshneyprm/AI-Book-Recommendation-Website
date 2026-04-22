const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Protect the entire admin route group
router.use('/admin', requireAuth, requireAdmin);

router.get('/admin', adminController.getAdminDashboard);
router.post('/api/admin/retrain-model', adminController.retrainModel);

module.exports = router;