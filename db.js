// db.js

const mysql = require('mysql2');
require('dotenv').config(); // Jika Anda menggunakan dotenv untuk mengelola variabel lingkungan

// Konfigurasi koneksi ke database MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Buat objek db untuk diexport
const db = pool.promise();

pool.on('error', (err) => {
  console.error('MySQL pool error:', err.message);
});

// Export objek db untuk digunakan dalam aplikasi
module.exports = db;
