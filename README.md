# GranthSync: AI Book Recommendation System

## Project Overview

The AI Book Recommendation System (GranthSync) is an intelligent, full-stack web application designed to streamline book discovery and tackle information overload. By moving away from static databases, the system dynamically fetches real-time metadata (titles, authors, cover art, synopses) using the Google Books API.

The platform features an AI-driven recommendation engine that learns from user behaviors—such as views, ratings, and wishlist additions—to curate highly personalized reading lists. Built with a robust Node.js/Express backend and a fast, server-side rendered EJS frontend, the system guarantees a secure, seamless, and responsive user experience.

## Key Features

AI "Cold-Start" Initialization: Requires users to select at least 3 preferred genres during registration to instantly generate a tailored recommendation profile.

Real-Time Cataloging: Seamlessly proxies search queries to the Google Books API, caching results into MongoDB to prevent duplicate API calls.

Personalized Libraries: Users can curate personal collections including a Wishlist, Currently Reading, and Reading History.

Behavioral Tracking Engine: Assigns algorithmic weights to user interactions to continuously refine AI recommendations.

Enterprise-Grade Security: Employs JSON Web Tokens (JWT) stored securely within HTTP-only cookies, mitigating client-side vulnerabilities.

## Technology Stack

Frontend View Engine: EJS (Embedded JavaScript), HTML5, CSS3, Vanilla JS

Backend Framework: Node.js, Express.js

Database & ODM: MongoDB, Mongoose

Authentication: JWT (JSON Web Tokens), bcrypt (password hashing)

External Integrations: Google Books API, axios

## Prerequisites & Installation Requirements

Before running the project locally, ensure you have the following software installed and configured on your machine:

### 1. Node.js & npm

Node.js is the runtime environment required to execute the backend server.

Download: Node.js Official Website

Version Requirement: v18.x or higher.

Verification: Open your terminal and run node -v and npm -v to ensure successful installation.

### 2. MongoDB

A NoSQL database used to store user credentials, cached book data, and interaction logs.

Local Setup: Download and install MongoDB Community Server.

Cloud Alternative: Set up a free cluster on MongoDB Atlas.

Tooling: It is highly recommended to install MongoDB Compass to visualize and manage your local or cloud database collections easily.

### 3. Code Editor

An Integrated Development Environment (IDE) is required for code inspection and configuration.

Recommended: Visual Studio Code (VS Code).

### 4. Web Browser & Internet Availability

Browser: Any modern, standards-compliant web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Network Requirement

An active broadband internet connection is strictly required for the application to function. The core discovery features rely on fetching real-time data from the Google Books API.

## Local Environment Setup

Follow these steps to configure and run the application on your local machine:

### Step 1: Clone the Repository

Open your terminal/command prompt and clone the project directory:

git clone : https://github.com/varshneyprm/AI-Book-Recommendation-Website

cd ai-book-recommendation-website

### Step 2: Install Dependencies

Install all required Node.js packages (Express, Mongoose, Axios, etc.) by running:

npm install

### Step 3: Configure Environment Variables

PORT=3000

MONGODB_URI=......

JWT_SECRET=my_super_secret_btech_project_key_2026

GOOGLE_BOOKS_API_KEY=.................

ADMIN_EMAIL=.................

ADMIN_PASSWORD=.........

### Step 4: Start the Server

You can run the application in two ways:

#### Option A: Standard Execution (Production Mode)

Starts the Node.js server normally. If you make changes to the code, you must manually restart the server.

node server.js

#### Option B: Development Execution (Hot-Reloading)

Uses nodemon to monitor your project directory and automatically restart the server whenever code changes are saved.
If you don't have nodemon installed globally, install it first:

npm install -g nodemon
Run the server:

nodemon server.js

### Step 5: Access the Application

Once the terminal displays Server running on http://localhost:3000 and Connected to MongoDB, open your web browser and navigate to http://localhost:3000.
