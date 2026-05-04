const mongoose = require('mongoose'); // Imports the Object Data Modeling library

/*
    Book Schema Definition
    Purpose: Maps the chaotic external data structures returned by the Google Books API into a predictable, standardized format for the internal MongoDB database.
    Behavior: Automatically generates timestamps for creation and updates.
*/
const bookSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true }, // Serves as the primary key bridging external API logic with local database logic
    title: { type: String, required: true },
    authors: [{ type: String }], // Utilizes an array since books frequently have multiple contributors
    description: { type: String },
    thumbnail: { type: String }, // Stores the URL string pointing to the cover asset, not the image file itself
    categories: [{ type: String }], // Utilizes an array to support the content-based recommendation filtering
    pageCount: { type: Number },
    publishedDate: { type: String }, // Stored as a string to handle inconsistent historical date formatting from external APIs
    averageRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 }
}, { timestamps: true }); // Instructs Mongoose to automatically manage createdAt and updatedAt fields

module.exports = mongoose.model('Book', bookSchema);