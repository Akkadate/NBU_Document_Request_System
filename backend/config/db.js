const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Ensure .env in parent is loaded if server.js is in root

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // เพิ่ม SSL option ถ้าจำเป็น
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
