const User = require('../models/User'); // Imports the schema representing user profiles
const Book = require('../models/Book'); // Imports the schema representing book data

// Generates the personalized hub summarizing the user's activity and targeted recommendations
const getDashboard = async (req, res) => {
    try {
        let user; // Initializes the variable to hold user data conditionally

        // Evaluates authentication state to handle development environments and live environments smoothly
        if (req.user) {
            // Retrieves the logged-in user and expands their array references into full book objects
            user = await User.findById(req.user._id).populate('wishlist currentlyReading');
        } else {
            // Development fallback: Pulls the newest registered profile to test the UI without constantly logging in
            user = await User.findOne().sort({ createdAt: -1 }).populate('wishlist currentlyReading');
        }

        // Catches an edge case where the database is entirely empty and forces redirection
        if (!user) {
            return res.redirect('/login');
        }

        // Executes a content-based recommendation query using the genres selected during account registration
        const recommendations = await Book.find({
            categories: { $in: user.preferredGenres } // Matches any book containing the user's liked subjects
        }).limit(4); // Ensures the interface does not break by providing a controlled array size

        res.render('dashboard', { user, recommendations, activePage: 'dashboard' }); // Injects all processed data into the EJS view engine
    } catch (error) {
        console.error('Error loading dashboard:', error); // Provides diagnostic feedback to the developer console
        res.status(500).render('error', { message: 'Failed to load user dashboard.' }); // Prevents an infinite loading state for the client
    }
};

module.exports = {
    getDashboard
};