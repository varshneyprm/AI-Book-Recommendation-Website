const User = require('../models/User');
const Book = require('../models/Book');

const getDashboard = async (req, res) => {
    try {
        // NOTE FOR YOUR PROJECT: In a fully finished app, you would use req.user._id from your session/JWT.
        // For testing this UI right now, if no user is logged in, we'll fetch the most recently registered user.
        let user;
        if (req.user) {
            user = await User.findById(req.user._id).populate('wishlist currentlyReading');
        } else {
            user = await User.findOne().sort({ createdAt: -1 }).populate('wishlist currentlyReading');
        }

        if (!user) {
            return res.redirect('/login');
        }

        // Core Recommendation Engine Trigger: Content-Based Filtering via Cold Start Data
        const recommendations = await Book.find({
            categories: { $in: user.preferredGenres }
        }).limit(4);

        res.render('dashboard', { user, recommendations, activePage: 'dashboard' });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).render('error', { message: 'Failed to load user dashboard.' });
    }
};

module.exports = {
    getDashboard
};