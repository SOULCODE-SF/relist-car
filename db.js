// db.js

const mysql = require('mysql2');
require('dotenv').config(); // Jika Anda menggunakan dotenv untuk mengelola variabel lingkungan

// Konfigurasi koneksi ke database MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Host MySQL (misalnya 'localhost')
  user: process.env.DB_USER, // Pengguna MySQL
  password: process.env.DB_PASSWORD, // Password MySQL
  database: process.env.DB_NAME, // Nama database MySQL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Buat objek db untuk diexport
const db = pool.promise();

// Export objek db untuk digunakan dalam aplikasi
module.exports = db;
