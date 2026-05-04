const { GoogleGenerativeAI } = require('@google/generative-ai'); // Imports the AI SDK
const Book = require('../models/Book'); // Imports the local database model

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Initializes the client

// Legacy search mechanism that extracts keywords via AI and uses complex regex to search the local database
const generateRecommendations = async (req, res) => {
    try {
        const { prompt, pacing, mood } = req.body; // Extracts standard fields from the payload
        console.log(`Analyzing Prompt: "${prompt}"`);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Targets the fast iteration model

        // Instructs the AI to act as a parser and return a specific, predictable data structure
        const aiPrompt = `
            You are a book recommendation engine. The user wants: "${prompt}".
            Provide exactly 5 single-word keywords, themes, or broad genres that fit this request. 
            Separate them with commas. No other text.
            Example: funny, comedy, family, humor, fiction
        `;

        const result = await model.generateContent(aiPrompt);
        const aiResponse = result.response.text(); // Retrieves the raw string output

        // Transforms the raw string into a clean, iterable array by splitting, stripping symbols, and filtering out small words
        const keywords = aiResponse.split(',')
            .map(kw => kw.trim().replace(/[^a-zA-Z]/g, ""))
            .filter(kw => kw.length > 2);

        console.log('AI Extracted Keywords:', keywords);

        // Dynamically builds a Regular Expression pattern connecting all keywords with OR logic
        const regexPattern = new RegExp(keywords.join('|'), 'i');

        // Queries the database to find any book where the category, title, or description matches the constructed pattern
        let books = await Book.find({
            $or: [
                { categories: regexPattern },
                { title: regexPattern },
                { description: regexPattern }
            ]
        }).limit(6);

        // Provides a static safety net if the complex query yields no results from a smaller database
        if (books.length === 0) {
            console.log('No exact matches found. Triggering fallback...');
            books = await Book.find().limit(4); // Grabs default documents blindly
        }

        res.status(200).json({ success: true, books: books });

    } catch (error) {
        console.error('Gemini AI Engine Error:', error);
        res.status(500).json({ success: false, message: 'Neural Network failed to process request.' });
    }
};

module.exports = {
    generateRecommendations
};