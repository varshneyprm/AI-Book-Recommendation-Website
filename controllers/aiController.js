const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const Book = require('../models/Book');

// Safely initialize SDK (Handles missing env variables without crashing)
const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
const genAI = new GoogleGenerativeAI(apiKey);

const generateRecommendations = async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log(`\n🧠 AI Co-Pilot Request: "${prompt}"`);

        let searchQuery = prompt; // Default to user's exact words

        // ==========================================
        // STAGE 1: GEMINI OPTIMIZATION (Failsafe)
        // ==========================================
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" },
                { apiVersion: 'v1' });
            const aiPrompt = `Extract exactly 2 broad search keywords for a book about: "${prompt}". Return only the keywords.`;
            const result = await model.generateContent(aiPrompt);
            const aiText = result.response.text().trim().replace(/["']/g, "");

            if (aiText && aiText.length > 2) {
                searchQuery = aiText;
                console.log(`✅ Gemini Optimized Query: "${searchQuery}"`);
            }
        } catch (geminiError) {
            console.log(`⚠️ Gemini bypassed (Using original prompt): "${searchQuery}"`);
        }

        // ==========================================
        // STAGE 2: LIVE GOOGLE BOOKS FETCH (Failsafe)
        // ==========================================
        let processedBooks = [];
        try {
            const googleKey = process.env.GOOGLE_BOOKS_API_KEY ? process.env.GOOGLE_BOOKS_API_KEY.trim() : '';
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=6&printType=books&key=${googleKey}`;

            const apiResponse = await axios.get(url);
            const items = apiResponse.data.items || [];

            if (items.length > 0) {
                processedBooks = await Promise.all(items.map(async (item) => {
                    const info = item.volumeInfo;
                    const bookData = {
                        title: info.title || 'Unknown Title',
                        authors: info.authors || ['Unknown Author'],
                        description: info.description || 'No description available.',
                        thumbnail: info.imageLinks ? info.imageLinks.thumbnail : 'https://via.placeholder.com/128x192.png?text=No+Cover',
                        categories: info.categories || [],
                        googleId: item.id
                    };
                    // Save to DB so 'View Details' links work
                    return await Book.findOneAndUpdate(
                        { googleId: item.id },
                        { $set: bookData },
                        { upsert: true, returnDocument: 'after' }
                    );
                }));
                console.log(`✅ Fetched ${processedBooks.length} live books from Google.`);
            }
        } catch (googleError) {
            console.log(`⚠️ Google API fetch failed. Triggering local database fallback.`);
        }

        // ==========================================
        // STAGE 3: LOCAL MONGODB FALLBACK
        // ==========================================
        if (processedBooks.length === 0) {
            console.log(`🔄 Searching local MongoDB for matches...`);

            // Turn search words into a flexible regex (e.g., /sci-fi|thriller/i)
            const regexPattern = new RegExp(searchQuery.split(' ').join('|'), 'i');
            processedBooks = await Book.find({
                $or: [
                    { categories: regexPattern },
                    { title: regexPattern }
                ]
            }).limit(6);

            // The Ultimate Safety Net: If NO matches found, just return 6 random books
            if (processedBooks.length === 0) {
                console.log(`⚠️ No exact DB matches. Returning random books for UI display.`);
                processedBooks = await Book.find().sort({ createdAt: -1 }).limit(6);
            }
        }

        // Send the final guaranteed array to the frontend
        res.status(200).json({ success: true, books: processedBooks });

    } catch (error) {
        console.error('❌ CRITICAL CONTROLLER ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Server error processing request.' });
    }
};

module.exports = { generateRecommendations };