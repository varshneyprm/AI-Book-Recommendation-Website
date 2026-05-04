const { GoogleGenerativeAI } = require('@google/generative-ai'); // Imports the Google Gemini SDK
const axios = require('axios'); // Imports the Axios library to handle external HTTP requests
const Book = require('../models/Book'); // Imports the Book schema to interact with the local database

// Safely initializes the AI client by checking for the API key first to prevent application crashes
const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
const genAI = new GoogleGenerativeAI(apiKey); // Creates the AI instance using the verified key

// Acts as the core engine for processing user moods and returning relevant books using a triple-fallback architecture
const generateRecommendations = async (req, res) => {
    try {
        const { prompt } = req.body; // Extracts the user's natural language input from the request
        console.log(`AI Co-Pilot Request: "${prompt}"`); // Logs the incoming request for monitoring

        let searchQuery = prompt; // Sets the default search term to the user's exact input

        // First Layer: Attempts to use the Gemini AI to optimize the user's input into highly effective search keywords
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' }); // Configures the specific AI model and forces standard API versioning
            const aiPrompt = `Extract exactly 2 broad search keywords for a book about: "${prompt}". Return only the keywords.`; // Constructs the strict instruction for the AI
            const result = await model.generateContent(aiPrompt); // Sends the prompt to Google's servers
            const aiText = result.response.text().trim().replace(/["']/g, ""); // Cleans the AI response by removing whitespace and accidental quotation marks

            // Validates that the AI returned a usable string before overwriting the default search query
            if (aiText && aiText.length > 2) {
                searchQuery = aiText;
                console.log(`Gemini Optimized Query: "${searchQuery}"`);
            }
        } catch (geminiError) {
            console.log(`Gemini bypassed (Using original prompt): "${searchQuery}"`); // Silently catches AI errors and continues with the raw user input
        }

        let processedBooks = []; // Initializes an empty array to hold the final book data

        // Second Layer: Attempts to fetch real-time book data from the live Google Books API
        try {
            const googleKey = process.env.GOOGLE_BOOKS_API_KEY ? process.env.GOOGLE_BOOKS_API_KEY.trim() : ''; // Safely retrieves the Google Books key
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=6&printType=books&key=${googleKey}`; // Constructs the API endpoint URL

            const apiResponse = await axios.get(url); // Executes the external network request
            const items = apiResponse.data.items || []; // Extracts the book array or defaults to an empty array to prevent undefined errors

            // Processes the external data if the API successfully found matching books
            if (items.length > 0) {
                processedBooks = await Promise.all(items.map(async (item) => {
                    const info = item.volumeInfo; // Isolates the metadata object for easier access

                    // Maps the external API structure to match the internal local database schema
                    const bookData = {
                        title: info.title || 'Unknown Title',
                        authors: info.authors || ['Unknown Author'],
                        description: info.description || 'No description available.',
                        thumbnail: info.imageLinks ? info.imageLinks.thumbnail : 'https://via.placeholder.com/128x192.png?text=No+Cover',
                        categories: info.categories || [],
                        googleId: item.id
                    };

                    // Updates existing books or creates new ones to ensure the local database stays synchronized with the live results
                    return await Book.findOneAndUpdate(
                        { googleId: item.id },
                        { $set: bookData },
                        { upsert: true, returnDocument: 'after' } // Silences Mongoose deprecation warnings while returning the updated document
                    );
                }));
                console.log(`Fetched ${processedBooks.length} live books from Google.`);
            }
        } catch (googleError) {
            console.log(`Google API fetch failed. Triggering local database fallback.`); // Silently catches network errors to trigger the final fallback layer
        }

        // Third Layer: Falls back to the internal MongoDB if the external APIs fail or return zero results
        if (processedBooks.length === 0) {
            console.log(`Searching local MongoDB for matches...`);

            // Converts the search terms into a flexible regular expression to cast a wider net in the database
            const regexPattern = new RegExp(searchQuery.split(' ').join('|'), 'i');
            processedBooks = await Book.find({
                $or: [
                    { categories: regexPattern }, // Searches the category array for matches
                    { title: regexPattern } // Searches the book titles for matches
                ]
            }).limit(6); // Restricts the result size to match the frontend UI layout

            // Absolute Failsafe: If the database has no textual matches, it returns a random selection of books to prevent an empty screen
            if (processedBooks.length === 0) {
                console.log(`No exact DB matches. Returning random books for UI display.`);
                processedBooks = await Book.find().sort({ createdAt: -1 }).limit(6); // Grabs the most recently added books
            }
        }

        res.status(200).json({ success: true, books: processedBooks }); // Transmits the guaranteed array of books back to the client interface

    } catch (error) {
        console.error('CRITICAL CONTROLLER ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Server error processing request.' });
    }
};

module.exports = { generateRecommendations };