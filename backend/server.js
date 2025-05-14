require('dotenv').config({ path: './.env' }); // Ensure this path is correct relative to server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL client

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes (configure appropriately for production)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Database Connection Pool (example from config/db.js)
/*
// backend/config/db.js
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
module.exports = pool;
*/
// const pool = require('./config/db'); // Assuming db.js is set up

// Test DB Connection (Optional)
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('Error connecting to the database', err.stack);
//   } else {
//     console.log('Successfully connected to the database. Server time:', res.rows[0].now);
//   }
// });


// --- Routes ---
// Example: app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/documents', require('./routes/documentRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend API is working!' });
});


// --- Error Handling Middleware (Basic) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`DB Host: ${process.env.DB_HOST}`); // Check if .env is loaded
});
