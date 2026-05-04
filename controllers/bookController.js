const axios = require('axios'); // Imports Axios to facilitate external API requests
const Book = require('../models/Book'); // Imports the Book schema definition

// Performs standard searches against the Google Books API and saves the results
const searchAndSaveBooks = async (req, res) => {
    try {
        const { query } = req.body; // Extracts the search term from the frontend payload
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required.' }); // Prevents execution if the search field is empty
        }

        const apiKey = process.env.GOOGLE_BOOKS_API_KEY; // Accesses the secure API key from environment variables

        // Dynamically builds the API endpoint using the user's query and forces a return limit of twelve books
        const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&key=${apiKey}`;

        const response = await axios.get(googleBooksApiUrl); // Calls the external service
        const items = response.data.items || []; // Extracts the book array or safely defaults to empty

        // Maps over the external data and simultaneously updates the local database
        const savedBooks = await Promise.all(items.map(async (item) => {
            const volumeInfo = item.volumeInfo; // Isolates the metadata payload

            // Constructs an object that matches the exact structure required by the local Book schema
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

            // Updates the book if it already exists or inserts it if it is entirely new
            return await Book.findOneAndUpdate(
                { googleId: item.id },
                { $set: bookData },
                { upsert: true, new: true } // Upsert is a database operation meaning update or insert
            );
        }));

        res.status(200).json({ success: true, data: savedBooks }); // Returns the synchronized data back to the frontend
    } catch (error) {
        console.error('Error fetching and saving books:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error while querying books.' });
    }
};

// Loads the specific details of a single book and powers the recommendation engine on that page
const getBookDetails = async (req, res) => {
    try {
        const { id } = req.params; // Grabs the database ID from the URL string
        const book = await Book.findById(id); // Queries the database for the exact book record

        if (!book) {
            return res.status(404).render('404', { message: 'Book not found in our database.' }); // Gracefully handles invalid or deleted book links
        }

        // Executes a content-based filtering query to find similar books based on shared categories
        const similarBooks = await Book.find({
            _id: { $ne: book._id }, // Ensures the currently viewed book is excluded from its own recommendations
            categories: { $in: book.categories } // Matches any books that share at least one category
        }).limit(4); // Restricts the layout block to four items

        res.render('bookDetails', { book, similarBooks }); // Injects the primary book and its recommendations into the template
    } catch (error) {
        console.error('Error retrieving book details:', error);
        res.status(500).render('error', { message: 'Server error loading book details.' });
    }
};

// Populates an empty database with initial content to simulate an active platform
const seedDatabase = async (req, res) => {
    try {
        // Defines a diverse list of search terms to gather a broad range of subjects
        const searchQueries = ['computer science', 'artificial intelligence', 'science fiction', 'startup business', 'fantasy magic'];
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        let totalSaved = 0; // Initializes a counter to track successful insertions

        // Iterates through each subject sequentially
        for (const query of searchQueries) {
            const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${apiKey}`;
            const response = await axios.get(googleBooksApiUrl);
            const items = response.data.items || [];

            // Processes all returned items for the current query concurrently
            await Promise.all(items.map(async (item) => {
                const volumeInfo = item.volumeInfo;
                const bookData = {
                    title: volumeInfo.title || 'Unknown Title',
                    authors: volumeInfo.authors || ['Unknown Author'],
                    description: volumeInfo.description || 'No synopsis available.',
                    thumbnail: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x192.png?text=No+Cover',
                    categories: volumeInfo.categories || [],
                    pageCount: volumeInfo.pageCount || 0,
                    publishedDate: volumeInfo.publishedDate || 'Unknown',
                    averageRating: volumeInfo.averageRating || 0,
                    ratingsCount: volumeInfo.ratingsCount || 0
                };

                await Book.findOneAndUpdate(
                    { googleId: item.id },
                    { $set: bookData },
                    { upsert: true, new: true }
                );
                totalSaved++; // Increments the counter for every successful save
            }));
        }

        res.status(200).send(`<h1>Database Seeded Successfully!</h1><p>Added ${totalSaved} books to MongoDB.</p><a href="/">Go back home</a>`);
    } catch (error) {
        console.error('Seeding Error:', error);
        res.status(500).send('Error seeding database.');
    }
};

module.exports = {
    searchAndSaveBooks,
    getBookDetails,
    seedDatabase
};