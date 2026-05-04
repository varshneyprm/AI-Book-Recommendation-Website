/*
    Administrative Routing Module
    Purpose: Defines the access paths for all administrative pages and API endpoints.
    Connection: Binds the Express router to the adminController functions while enforcing strict role-based access control via middleware.
*/
const express = require('express'); // Imports the Express framework to handle routing
const router = express.Router(); // Initializes an isolated routing instance
const adminController = require('../controllers/adminController'); // Imports the logic for handling administrative tasks
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware'); // Imports security functions to protect these routes

/*
    Security Middleware Application
    Forces every route defined below these lines to pass through the authentication and administrative validation checks before executing.
*/
router.use('/admin', requireAuth, requireAdmin);
router.use('/api/admin', requireAuth, requireAdmin);

router.get('/admin', adminController.getAdminDashboard); // Maps the root admin URL to the dashboard view controller
router.get('/admin/users', adminController.getUserManagement); // Maps the user management URL to the user list controller
router.get('/admin/inventory', adminController.getBookInventory); // Maps the inventory URL to the book list controller

router.post('/api/admin/retrain-model', adminController.retrainModel); // Exposes an endpoint to trigger the machine learning update simulation

/*
    Resource Deletion Endpoints
    Provides specific network paths for the frontend Javascript to send destructive HTTP DELETE requests.
*/
router.delete('/api/admin/users/:id', adminController.deleteUser); // Accepts a dynamic user ID parameter for account removal
router.delete('/api/admin/books/:id', adminController.deleteBook); // Accepts a dynamic book ID parameter for inventory removal

module.exports = router; // Exports the configured router to be mounted in the main application file