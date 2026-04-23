const jwt = require('jsonwebtoken');

// 👤 Standard User Check (Protects regular user routes)
const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
            } else {
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
};

// 👑 Admin-Only Check (Protects the /admin route)
const requireAdmin = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err || decodedToken.role !== 'admin') {
                // If they have a valid token but ARE NOT an admin, send them to the homepage
                res.redirect('/');
            } else {
                // They are the admin! Let them through to the dashboard
                next();
            }
        });
    } else {
        // No token at all, send to login
        res.redirect('/login');
    }
};

// 👇 Make sure BOTH are exported so your route files can see them!
module.exports = {
    requireAuth,
    requireAdmin
};