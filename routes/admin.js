const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getUser,
  getAllBanners,
  addBanner,
  addUser,
} = require('../src/controllers/adminController');

// Fungsi untuk menentukan direktori penyimpanan dinamis berdasarkan jenis upload
const dynamicStorage = (type) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadDir = path.join(__dirname, `../public/uploads/${type}`);
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname +
          '-' +
          Date.now() +
          path.extname(file.originalname) +
          '.webp'
      );
    },
  });
};

// Inisialisasi Multer dengan konfigurasi storage dinamis
const upload = (type) => multer({ storage: dynamicStorage(type) });

router.get('/', (req, res) => {
  res.render('admin/index', {
    title: 'Dashboard Admin',
    currentPage: 'admin-index',
    layout: './admin/layouts/layout',
  });
});

router.get('/page', (req, res) => {
  res.render('admin/page/index', {
    title: 'Page',
    currentPage: 'admin-page',
    layout: './admin/layouts/layout',
  });
});

router.get('/page/add', (req, res) => {
  res.render('admin/page/add-page', {
    title: 'Add Page',
    currentPage: 'admin-add-page',
    layout: './admin/layouts/layout',
  });
});

router.get('/banner', getAllBanners);

router.get('/banner/add', (req, res) => {
  res.render('admin/banner/add', {
    title: 'Add Banner',
    currentPage: 'admin-add-banner',
    layout: './admin/layouts/layout',
  });
});

router.post('/banner/add', upload('banners').single('ads_image'), addBanner);

router.get('/users', getUser);
router.post('/users/add', addUser);

module.exports = router;
