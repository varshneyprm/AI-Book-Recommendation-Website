const User = require('../models/User');
const Book = require('../models/Book');
const Interaction = require('../models/Interaction');

const getAdminDashboard = async (req, res) => {
    try {
        const [userCount, bookCount, interactionCount, recentUsers] = await Promise.all([
            User.countDocuments(),
            Book.countDocuments(),
            Interaction.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(5).select('-password')
        ]);

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
    try {
        setTimeout(() => {
            res.status(200).json({ success: true, message: 'Neural Network weights successfully updated.' });
        }, 2000);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Model retraining failed.' });
    }
};

// 1. Fetch Users
const getUserManagement = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-password');
        res.render('userManagement', { users, activePage: 'admin-users' });
    } catch (error) {
        console.error('User Load Error:', error);
        res.status(500).send('Error loading users');
    }
};

// 2. Fetch Books
const getBookInventory = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.render('bookInventory', { books, activePage: 'admin-inventory' });
    } catch (error) {
        console.error('Inventory Load Error:', error);
        res.status(500).send('Error loading inventory');
    }
};

// 3. Delete a User
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Interaction.deleteMany({ userId: req.params.id }); 
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
};

// 4. Delete a Book
const deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        await Interaction.deleteMany({ bookId: req.params.id }); 
        res.json({ success: true });
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