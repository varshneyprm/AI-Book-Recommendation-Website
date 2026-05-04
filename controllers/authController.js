const User = require('../models/User'); // Imports the User schema to interact with accounts
const jwt = require('jsonwebtoken'); // Imports JSON Web Token logic for secure session management

// Delivers the registration HTML page to the client
const renderRegister = (req, res) => {
    res.render('register', { activePage: 'register', error: null }); // Injects variables into the EJS template
};

// Handles the creation of new user accounts and profile setup
const registerUser = async (req, res) => {
    try {
        const { username, email, password, genres } = req.body; // Extracts account details from the submitted form

        // Converts the comma-separated string from the frontend into a clean array of strings
        const preferredGenres = genres ? genres.split(',').map(g => g.trim()) : [];

        // Enforces a business logic rule ensuring the AI has enough data to start generating recommendations
        if (preferredGenres.length < 3) {
            return res.status(400).json({ success: false, message: 'Please select at least 3 genres for your AI profile.' });
        }

        // Queries the database to prevent duplicate accounts
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username or Email already exists.' });
        }

        // Constructs a new user document in memory
        const newUser = new User({
            username,
            email,
            password, 
            preferredGenres
        });

        await newUser.save(); // Commits the new user to the database permanently

        res.status(201).json({ success: true, message: 'Account created! AI model initialized.' }); // Responds with a success code to trigger frontend redirection
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

// Delivers the login HTML page to the client
const renderLogin = (req, res) => {
    res.render('login', { activePage: 'login', error: null });
};

// Authenticates credentials and generates secure session tokens
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Bypasses the database to check if the credentials match the hardcoded system administrator account
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

            // Generates a specialized token containing the admin role
            const token = jwt.sign(
                { email: email, role: 'admin' },
                process.env.JWT_SECRET, // Signs the token with a private key to prevent tampering
                { expiresIn: '1d' } // Limits the session lifespan to 24 hours
            );

            // Attaches the token to the client's browser as a secure, HTTP-only cookie
            res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            return res.status(200).json({ success: true, redirectUrl: '/admin' }); // Directs the admin to their specific dashboard
        }

        // Queries the database to find standard users by their email address
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' }); // Returns a generic error to prevent account enumeration
        }

        // Validates the password against the stored database record
        if (password !== user.password) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Generates a standard token containing the user's database ID and role
        const token = jwt.sign(
            { id: user._id, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // Sets the authentication cookie
        return res.status(200).json({ success: true, redirectUrl: '/' }); // Directs standard users to the main application interface

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// Destroys the active session and logs the user out
const logoutUser = (req, res) => {
    // Overwrites the existing JWT cookie with an empty one that expires immediately
    res.cookie('jwt', '', { maxAge: 1 });
    
    res.redirect('/login'); // Sends the user back to the public authentication screen
};

module.exports = {
    renderRegister,
    registerUser,
    renderLogin,
    loginUser,
    logoutUser
};