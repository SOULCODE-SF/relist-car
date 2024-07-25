// src/middleware/authMiddleware.js

// Middleware untuk memeriksa apakah pengguna adalah admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.role === 'admin') {
    return next(); // Pengguna adalah admin, lanjutkan ke route berikutnya
  }
  res.redirect('/login'); // Pengguna bukan admin, arahkan ke halaman login
};

// Middleware untuk memeriksa apakah pengguna telah login
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login'); // Pengguna belum login, arahkan ke halaman login
};

module.exports = {
  isAdmin,
  isAuthenticated,
};
