require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser()); // Crucial for reading JWT cookies

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Route Wiring
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/bookRoutes'));
app.use('/', require('./routes/userRoutes'));
app.use('/', require('./routes/adminRoutes'));
app.use('/', require('./routes/interactionRoutes'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// 404 Handler (Optional but good for presentation)
app.use((req, res) => {
    res.status(404).send('Page not found');
});