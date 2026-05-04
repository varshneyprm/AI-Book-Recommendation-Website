// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const Book = require('../models/Book');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const generateRecommendations = async (req, res) => {
//     try {
//         const { prompt, pacing, mood } = req.body;
//         console.log(`🧠 Analyzing Prompt: "${prompt}"`);

//         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
//         // 1. Better Prompt: Ask for 5 single words to cast a wider net
//         const aiPrompt = `
//             You are a book recommendation engine. The user wants: "${prompt}".
//             Provide exactly 5 single-word keywords, themes, or broad genres that fit this request. 
//             Separate them with commas. No other text.
//             Example: funny, comedy, family, humor, fiction
//         `;

//         const result = await model.generateContent(aiPrompt);
//         const aiResponse = result.response.text();
        
//         // Clean the keywords and remove empty ones
//         const keywords = aiResponse.split(',')
//             .map(kw => kw.trim().replace(/[^a-zA-Z]/g, ""))
//             .filter(kw => kw.length > 2); // Ignore tiny words
            
//         console.log('🤖 AI Extracted Keywords:', keywords);

//         // 2. The Ultra-Forgiving Search
//         // This turns ['comedy', 'humor'] into a regex like /comedy|humor/i
//         const regexPattern = new RegExp(keywords.join('|'), 'i');

//         let books = await Book.find({
//             $or: [
//                 { categories: regexPattern },
//                 { title: regexPattern },
//                 { description: regexPattern }
//             ]
//         }).limit(6);

//         // 3. The Ultimate Fallback
//         // If your database is too small and misses the regex, just grab 4 random books!
//         if (books.length === 0) {
//             console.log('⚠️ No exact matches found. Triggering fallback...');
//             books = await Book.find().limit(4); 
//         }

//         res.status(200).json({ success: true, books: books });

//     } catch (error) {
//         console.error('Gemini AI Engine Error:', error);
//         res.status(500).json({ success: false, message: 'Neural Network failed to process request.' });
//     }
// };

// module.exports = {
//     generateRecommendations
// };