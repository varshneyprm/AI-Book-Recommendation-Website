const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    // Cold Start Data & AI Tracking
    preferredGenres: [{ type: String }],
    
    // User Library
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    currentlyReading: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    readingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);