const Interaction = require('../models/Interaction');
const User = require('../models/User'); // 1. NEW: Import the User model

const trackUserInteraction = async (req, res) => {
    try {
        // Ensure user is logged in before tracking
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Anonymous telemetry ignored.' });
        }

        const { bookId, interactionType, rating } = req.body;
        const userId = req.user._id;

        // Base weights for different interaction types (helps the AI algorithm later)
        const weightMap = {
            'view': 1,
            'wishlist': 3,
            'currently_reading': 4,
            'completed': 5,
            'rating': rating ? rating : 1
        };

        const weight = weightMap[interactionType] || 1;

        // Upsert the interaction. If they view it multiple times, we just increase the weight.
        await Interaction.findOneAndUpdate(
            { userId, bookId, interactionType },
            {
                $inc: { weight: weight },
                $set: { rating: rating } // Update rating if it's a rating interaction
            },
            { upsert: true, new: true }
        );

        // 2. NEW: Actually save the book to the user's profile arrays using $addToSet
        if (interactionType === 'wishlist') {
            await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: bookId } });
        } else if (interactionType === 'currently_reading') {
            await User.findByIdAndUpdate(userId, { $addToSet: { currentlyReading: bookId } });
        } else if (interactionType === 'completed') {
            // Saves to the readingHistory array when "Mark As Read" is clicked
            await User.findByIdAndUpdate(userId, { $addToSet: { readingHistory: bookId } });
        }

        // Fail silently and successfully for the frontend
        res.status(200).json({ success: true, message: 'Telemetry logged and profile updated.' });
    } catch (error) {
        console.error('Telemetry Error:', error);
        // We still return 200 to the frontend so we don't break the UI for background tracking errors
        res.status(200).json({ success: false, message: 'Telemetry failed silently.' });
    }
};

module.exports = {
    trackUserInteraction
};