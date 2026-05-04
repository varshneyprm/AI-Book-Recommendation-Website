const mongoose = require('mongoose');

/*
    User Profile Schema
    Purpose: Defines the structure for account authentication, system roles, and personalized library management.
*/
const userSchema = new mongoose.Schema({
    // Authentication Core
    username: { type: String, required: true, unique: true, trim: true }, // Forces uniqueness and strips accidental whitespace
    email: { type: String, required: true, unique: true, lowercase: true }, // Normalizes email inputs to lowercase to prevent duplicate account creation errors
    password: { type: String, required: true }, // Stores the cryptographic hash of the user's password
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Assigns standard permissions by default

    // Machine Learning Data Variables
    preferredGenres: [{ type: String }], // Captures the 'Cold Start' data collected during the initial registration survey to bootstrap the recommendation engine

    // Relational Library Arrays
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }], // Stores pointers to the Book collection rather than duplicating entire book objects
    currentlyReading: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    readingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);