require('dotenv').config(); // Loads .env file variables into process.env
const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // To initialize pool and log connection

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5500', // Or your frontend origin e.g. http://127.0.0.1:5500 for Live Server
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // If you need to send cookies or authorization headers
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test DB Connection by trying to query
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('!!! Database Connection Failed !!!', err.stack);
  } else {
    console.log('PostgreSQL connected. Server time:', res.rows[0].now);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);



// Simple test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', message: 'Backend API is healthy!', timestamp: new Date().toISOString() });
});

// Global Error Handler (very basic)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ message: 'An unexpected server error occurred.' });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log(`Frontend expected at http://localhost:5500 (or your dev server port)`);
});
