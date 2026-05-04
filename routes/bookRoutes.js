/*
    Public Book Routing Module
    Purpose: Handles user navigation for core platform features including standard searching, AI discovery, and viewing specific book details.
    Connection: Routes traffic to both the standard bookController and the advanced aiController.
*/
const express = require('express'); // Imports the Express framework
const router = express.Router(); // Initializes the routing instance
const bookController = require('../controllers/bookController'); // Imports functions related to standard database and API operations
const aiController = require('../controllers/aiController'); // Imports functions related to the generative neural network operations

/*
    Primary Application Interface
    Serves the initial search page when users arrive at the root domain.
*/
router.get('/', (req, res) => {
    res.render('search', { activePage: 'home' }); // Renders the search template and passes a variable to highlight the active navigation link
});

router.post('/api/books/search', bookController.searchAndSaveBooks); // Processes standard keyword searches against the external provider
router.get('/book/:id', bookController.getBookDetails); // Serves the detailed view and recommendations for a single specific book

/*
    AI Discovery Interface
    Serves the specialized page where users can input natural language prompts.
*/
router.get('/discovery', (req, res) => {
    res.render('discovery', { activePage: 'discovery' }); // Renders the AI interface template
});

router.post('/api/discover', aiController.generateRecommendations); // Receives natural language prompts and returns optimized book arrays
router.get('/seed-database', bookController.seedDatabase); // Provides a development endpoint to rapidly populate an empty database

module.exports = router; // Exports the configured routes