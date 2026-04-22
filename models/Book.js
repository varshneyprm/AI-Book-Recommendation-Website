const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    authors: [{ type: String }],
    description: { type: String },
    thumbnail: { type: String },
    categories: [{ type: String }],
    pageCount: { type: Number },
    publishedDate: { type: String },
    averageRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);