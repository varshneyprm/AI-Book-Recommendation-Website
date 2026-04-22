const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    const token = req.cookies ? req.cookies.jwt : null;
    
    if (!token) {
        return res.redirect('/login');
    }

    try {
        // In production, use process.env.JWT_SECRET instead of a hardcoded string
        const decoded = jwt.verify(token, 'librarAI_super_secret_key_2026'); 
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.redirect('/login');
        }
        
        req.user = user;
        res.locals.user = user; // Makes user data globally available in EJS templates
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        res.redirect('/login');
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).render('404', { message: 'Access Denied: Administrator privileges required.' });
    }
};

module.exports = { requireAuth, requireAdmin };