// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Ensure path is required
const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes'); // <--- เพิ่มบรรทัดนี้

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5500', // Or your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test DB Connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('!!! Database Connection Failed !!!', err.stack);
  } else {
    console.log('PostgreSQL connected. Server time:', res.rows[0].now);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes); // For student-specific document actions
app.use('/api/admin', adminRoutes);       // For admin-specific actions <--- เพิ่มบรรทัดนี้

app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', message: 'Backend API is healthy!', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ message: 'An unexpected server error occurred.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
