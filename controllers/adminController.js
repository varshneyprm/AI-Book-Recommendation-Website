const User = require('../models/User');
const Book = require('../models/Book');
const Interaction = require('../models/Interaction');

const getAdminDashboard = async (req, res) => {
    try {
        // Run database aggregation queries in parallel for performance
        const [userCount, bookCount, interactionCount, recentUsers] = await Promise.all([
            User.countDocuments(),
            Book.countDocuments(),
            Interaction.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(5).select('-password')
        ]);

        // Calculate AI Health / Engagement Rate (Mock logic for presentation)
        const engagementRate = userCount > 0 ? ((interactionCount / userCount) * 10).toFixed(1) : 0;

        res.render('adminDashboard', {
            stats: {
                users: userCount,
                books: bookCount,
                interactions: interactionCount,
                engagementRate: engagementRate
            },
            recentUsers,
            activePage: 'admin'
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).send('Server Error Loading Admin Panel');
    }
};

const retrainModel = async (req, res) => {
    // This is a simulated endpoint to demonstrate ML pipeline triggering
    try {
        setTimeout(() => {
            res.status(200).json({ success: true, message: 'Neural Network weights successfully updated based on latest interaction matrices.' });
        }, 2000);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Model retraining failed.' });
    }
};

module.exports = {
    getAdminDashboard,
    retrainModel
};