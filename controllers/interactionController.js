const Interaction = require('../models/Interaction'); // Imports the schema responsible for tracking user behavior
const User = require('../models/User'); // Imports the User schema to update their active lists

// Records telemetry data from the frontend buttons to build personalized machine learning matrices
const trackUserInteraction = async (req, res) => {
    try {
        // Validates that the request is coming from an authenticated session to prevent garbage data
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Anonymous telemetry ignored.' });
        }

        const { bookId, interactionType, rating } = req.body; // Extracts the telemetry payload
        const userId = req.user._id; // Identifies the user generating the event

        // Defines an internal hierarchy of values indicating the strength of the user's preference
        const weightMap = {
            'view': 1,
            'wishlist': 3,
            'currently_reading': 4,
            'completed': 5,
            'rating': rating ? rating : 1 // Applies custom weights if the user provides an explicit rating
        };

        const weight = weightMap[interactionType] || 1; // Determines the mathematical weight or defaults to base

        // Updates the distinct interaction record while incrementing the total weight for repeat actions
        await Interaction.findOneAndUpdate(
            { userId, bookId, interactionType },
            {
                $inc: { weight: weight }, // Mathematically adds the new weight to the existing total
                $set: { rating: rating } // Explicitly overwrites the rating value
            },
            { upsert: true, new: true } // Creates the document if the user hasn't interacted with this book before
        );

        // Dynamically sorts the book into the corresponding array within the User's master profile
        if (interactionType === 'wishlist') {
            await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: bookId } }); // $addToSet prevents identical books from being duplicated
        } else if (interactionType === 'currently_reading') {
            await User.findByIdAndUpdate(userId, { $addToSet: { currentlyReading: bookId } }); // Pushes the ID to the active reading list
        } else if (interactionType === 'completed') {
            await User.findByIdAndUpdate(userId, { $addToSet: { readingHistory: bookId } }); // Archives the book in their historical data
        }

        res.status(200).json({ success: true, message: 'Telemetry logged and profile updated.' }); // Informs the frontend that tracking succeeded
    } catch (error) {
        console.error('Telemetry Error:', error);
        res.status(200).json({ success: false, message: 'Telemetry failed silently.' }); // Returns success to the frontend regardless, preventing UX disruption due to background analytical errors
    }
};

module.exports = {
    trackUserInteraction
};