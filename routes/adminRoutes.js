const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.use('/admin', requireAuth, requireAdmin);
router.use('/api/admin', requireAuth, requireAdmin); // Protect API routes too

router.get('/admin', adminController.getAdminDashboard);
router.get('/admin/users', adminController.getUserManagement);
router.get('/admin/inventory', adminController.getBookInventory);

router.post('/api/admin/retrain-model', adminController.retrainModel);

// NEW: Delete Routes
router.delete('/api/admin/users/:id', adminController.deleteUser);
router.delete('/api/admin/books/:id', adminController.deleteBook);

module.exports = router;