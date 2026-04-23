const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    interactionType: {
        type: String,
        enum: ['view', 'wishlist', 'rating', 'currently_reading', 'completed'],
        required: true
    },
    rating: { type: Number, min: 1, max: 5 },
    weight: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Interaction', interactionSchema);