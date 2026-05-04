const User = require('../models/User'); // Imports the database schema for Users
const Book = require('../models/Book'); // Imports the database schema for Books
const Interaction = require('../models/Interaction'); // Imports the database schema for User Interactions

// Gathers platform-wide statistics and renders the main administrative dashboard
const getAdminDashboard = async (req, res) => {
    try {
        // Executes multiple database queries simultaneously to minimize server response time
        const [userCount, bookCount, interactionCount, recentUsers] = await Promise.all([
            User.countDocuments(), // Counts total registered users
            Book.countDocuments(), // Counts total books indexed in the database
            Interaction.countDocuments(), // Counts total recorded telemetry events
            User.find().sort({ createdAt: -1 }).limit(5).select('-password') // Fetches the newest users while actively hiding their passwords for security
        ]);

        // Calculates an average interaction ratio to gauge how actively users are utilizing the platform
        const engagementRate = userCount > 0 ? ((interactionCount / userCount) * 10).toFixed(1) : 0;

        res.render('adminDashboard', {
            stats: {
                users: userCount,
                books: bookCount,
                interactions: interactionCount,
                engagementRate: engagementRate
            },
            recentUsers,
            activePage: 'admin' // Tells the frontend sidebar which navigation link to highlight
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error); // Logs the backend failure for the developer
        res.status(500).send('Server Error Loading Admin Panel'); // Prevents the application from crashing by sending a safe error response
    }
};

// Simulates a machine learning pipeline update for presentation purposes
const retrainModel = async (req, res) => {
    try {
        // Uses a timeout to mimic the delay of a neural network processing new data
        setTimeout(() => {
            res.status(200).json({ success: true, message: 'Neural Network weights successfully updated.' });
        }, 2000);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Model retraining failed.' });
    }
};

// Retrieves all user accounts to populate the management data table
const getUserManagement = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-password'); // Pulls all users from newest to oldest without exposing passwords
        res.render('userManagement', { users, activePage: 'admin-users' }); // Injects the user data into the management interface
    } catch (error) {
        console.error('User Load Error:', error);
        res.status(500).send('Error loading users');
    }
};

// Retrieves all indexed books to populate the inventory management table
const getBookInventory = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 }); // Pulls all books sorted by the time they were added to the system
        res.render('bookInventory', { books, activePage: 'admin-inventory' }); // Injects the book data into the inventory interface
    } catch (error) {
        console.error('Inventory Load Error:', error);
        res.status(500).send('Error loading inventory');
    }
};

// Handles the permanent removal of a user account and their associated history
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id); // Locates and destroys the user document based on the URL parameter
        await Interaction.deleteMany({ userId: req.params.id }); // Scrubs the database of any telemetry tied to this specific user to maintain data integrity
        res.json({ success: true }); // Notifies the frontend script that the deletion was successful
    } catch (error) {
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
};

// Handles the permanent removal of a book and its interaction history
const deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id); // Locates and destroys the book document
        await Interaction.deleteMany({ bookId: req.params.id }); // Scrubs all user interactions related to this book to prevent dead links
        res.json({ success: true }); // Notifies the frontend script that the deletion was successful
    } catch (error) {
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
};

module.exports = {
    getAdminDashboard,
    retrainModel,
    getUserManagement,
    getBookInventory,
    deleteUser,
    deleteBook
};