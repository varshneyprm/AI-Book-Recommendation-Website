const axios = require('axios');
const Book = require('../models/Book');

const searchAndSaveBooks = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required.' });
        }

        // 1. Retrieve the API Key from your .env file
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

        // 2. Updated URL including the &key= parameter
        const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&key=${apiKey}`;
        
        const response = await axios.get(googleBooksApiUrl);
        const items = response.data.items || [];

        const savedBooks = await Promise.all(items.map(async (item) => {
            const volumeInfo = item.volumeInfo;
            
            const bookData = {
                title: volumeInfo.title || 'Unknown Title',
                authors: volumeInfo.authors || ['Unknown Author'],
                description: volumeInfo.description || 'No synopsis available for this title.',
                thumbnail: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x192.png?text=No+Cover',
                categories: volumeInfo.categories || [],
                pageCount: volumeInfo.pageCount || 0,
                publishedDate: volumeInfo.publishedDate || 'Unknown',
                averageRating: volumeInfo.averageRating || 0,
                ratingsCount: volumeInfo.ratingsCount || 0
            };

            // 3. Upsert logic to prevent duplicate books in your database
            return await Book.findOneAndUpdate(
                { googleId: item.id },
                { $set: bookData },
                { upsert: true, new: true }
            );
        }));

        res.status(200).json({ success: true, data: savedBooks });
    } catch (error) {
        console.error('Error fetching and saving books:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error while querying books.' });
    }
};

const getBookDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        
        if (!book) {
            return res.status(404).render('404', { message: 'Book not found in our database.' });
        }

        // AI Logic: Find similar books based on the same categories
        const similarBooks = await Book.find({
            _id: { $ne: book._id },
            categories: { $in: book.categories }
        }).limit(4);

        res.render('bookDetails', { book, similarBooks });
    } catch (error) {
        console.error('Error retrieving book details:', error);
        res.status(500).render('error', { message: 'Server error loading book details.' });
    }
};

module.exports = {
    searchAndSaveBooks,
    getBookDetails
};