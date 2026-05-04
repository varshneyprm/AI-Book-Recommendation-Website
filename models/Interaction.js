const mongoose = require('mongoose');

/*
    Interaction Telemetry Schema
    Purpose: Functions as the core logging ledger tracking every meaningful action a user takes on the platform.
    Usage: This collection forms the dataset that informs the artificial intelligence recommendation engine about user preferences.
*/
const interactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Establishes a relational link back to the user who triggered the event
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true }, // Establishes a relational link back to the target book

    // Constrains the acceptable event types to prevent database pollution
    interactionType: {
        type: String,
        enum: ['view', 'wishlist', 'rating', 'currently_reading', 'completed'],
        required: true
    },

    rating: { type: Number, min: 1, max: 5 }, // Records explicit feedback, validating that the value remains within standard boundaries
    weight: { type: Number, default: 1 } // Defines the algorithmic importance of this specific interaction type
}, { timestamps: true });

module.exports = mongoose.model('Interaction', interactionSchema);