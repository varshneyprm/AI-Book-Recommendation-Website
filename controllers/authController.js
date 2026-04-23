const User = require('../models/User');
const jwt = require('jsonwebtoken'); // 👈 Required for creating login cookies

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

// 👇 THIS WAS THE MISSING FUNCTION 👇
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 👑 1. ADMIN CHECK: Look at the .env file first
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

            // Generate an Admin Token
            const token = jwt.sign(
                { email: email, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            // Set the cookie and send the redirect URL back to the frontend
            res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            return res.status(200).json({ success: true, redirectUrl: '/admin' });
        }

        // 👤 2. REGULAR USER CHECK: Look at the MongoDB database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Note: Comparing plain text since bcrypt isn't in your register route yet.
        if (password !== user.password) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Generate a Regular User Token
        const token = jwt.sign(
            { id: user._id, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        return res.status(200).json({ success: true, redirectUrl: '/' }); // Redirect normal users to homepage

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

module.exports = {
    renderRegister,
    registerUser,
    renderLogin,
    loginUser // 👈 Now this will work because the function exists above!
};