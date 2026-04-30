const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Crucial: Imports the User model

// 👤 Standard User Check
const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
            } else {
                try {
                    // THIS is what fixes your bug. It grabs the user and attaches it.
                    const user = await User.findById(decodedToken.id);
                    req.user = user;
                    next();
                } catch (error) {
                    console.error("Middleware DB Error:", error);
                    res.redirect('/login');
                }
            }
        });
    } else {
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ success: false, message: 'You must be logged in.' });
        }
        res.redirect('/login');
    }
};

// 👑 Admin-Only Check
const requireAdmin = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err || decodedToken.role !== 'admin') {
                res.redirect('/');
            } else {
                try {
                    const user = await User.findById(decodedToken.id);
                    req.user = user;
                    next();
                } catch (error) {
                    res.redirect('/login');
                }
            }
        });
    } else {
        res.redirect('/login');
    }
};

module.exports = {
    requireAuth,
    requireAdmin
};