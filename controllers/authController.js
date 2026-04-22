const User = require('../models/User');

const renderRegister = (req, res) => {
    res.render('register', { activePage: 'register', error: null });
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password, genres } = req.body;

        // Parse genres from the frontend (sent as a comma-separated string)
        const preferredGenres = genres ? genres.split(',').map(g => g.trim()) : [];

        if (preferredGenres.length < 3) {
            return res.status(400).json({ success: false, message: 'Please select at least 3 genres for your AI profile.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username or Email already exists.' });
        }

        const newUser = new User({
            username,
            email,
            password, // Remember to add bcrypt hashing here later!
            preferredGenres
        });

        await newUser.save();
        
        res.status(201).json({ success: true, message: 'Account created! AI model initialized.' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

const renderLogin = (req, res) => {
    res.render('login', { activePage: 'login', error: null });
};

module.exports = {
    renderRegister,
    registerUser,
    renderLogin
};