/*
    Main Server Entry Point
    Purpose: Bootstraps the Express application, configures global middleware, establishes the database connection, and mounts all routing modules.
*/
require('dotenv').config(); // Loads environment variables from the configuration file securely into process.env
const express = require('express'); // Imports the primary Express application framework
const mongoose = require('mongoose'); // Imports the Mongoose library to interface with MongoDB clusters
const cookieParser = require('cookie-parser'); // Imports utility middleware to extract and parse HTTP cookie headers

const app = express(); // Initializes the core server instance

/*
    Global Middleware Configuration
    Pre-processes incoming requests before they reach the designated routing functions.
*/
app.set('view engine', 'ejs'); // Assigns Embedded JavaScript as the default engine for rendering dynamic HTML
app.use(express.json()); // Parses incoming requests containing JSON payloads automatically
app.use(express.urlencoded({ extended: true })); // Parses incoming requests containing URL-encoded form data
app.use(express.static('public')); // Maps the public directory to serve static client-side assets like CSS and images
app.use(cookieParser()); // Processes incoming cookies, an essential step for JWT session validation

/*
    Database Initialization
    Attempts to establish an asynchronous connection to the remote or local MongoDB instance defined in the environment variables.
*/
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err)); // Traps fatal connection logic errors to aid debugging

/*
    Router Mounting
    Organizes the application by delegating specific URL path segments to modular router files.
*/
app.use('/', require('./routes/authRoutes')); // Mounts all endpoints related to account creation and verification
app.use('/', require('./routes/bookRoutes')); // Mounts all endpoints governing general database querying and specific book details
app.use('/', require('./routes/userRoutes')); // Mounts the endpoints controlling personalized hubs and reading histories
app.use('/', require('./routes/adminRoutes')); // Mounts the secured endpoints designed for high-level system modifications
app.use('/', require('./routes/interactionRoutes')); // Mounts the endpoint managing silent telemetry data collection

const PORT = process.env.PORT || 3000; // Establishes a fallback networking port to support various hosting environments

// Binds the Express application to the designated port and begins listening for network activity
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

/*
    Final Request Interceptor
    Captures any incoming network requests that failed to match the defined routing logic above and serves a fallback response.
*/
app.use((req, res) => {
    res.status(404).send('Page not found');
});