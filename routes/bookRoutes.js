const express = require('express'); // 1. Import Express
const router = express.Router();    // 2. Initialize the router
const bookController = require('../controllers/bookController'); // 3. Import Controller
const aiController = require('../controllers/aiController');

// 4. Define the Homepage route (Fixes the "Page not found" error)
router.get('/', (req, res) => {
    res.render('search', { activePage: 'home' });
});

// 5. Your existing routes
router.post('/api/books/search', bookController.searchAndSaveBooks);
router.get('/book/:id', bookController.getBookDetails);

router.get('/discovery', (req, res) => {
    res.render('discovery', { activePage: 'discovery' });
});

router.post('/api/discover', aiController.generateRecommendations);
router.get('/seed-database', bookController.seedDatabase);

module.exports = router; // 6. Export it