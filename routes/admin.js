const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { getUser, addUser } = require('../src/controllers/adminController');
const {
  addBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  getAddBanner,
} = require('../src/controllers/adminController/banners');
const {
  getBrandsName,
  getModelName,
  addCar,
  getCarsList,
  getGenerationName,
  getAddCar,
} = require('../src/controllers/adminController/cars');
const {
  getDashboardPage,
} = require('../src/controllers/adminController/dashboard');
const { isAuthenticated, isAdmin } = require('./middlewares/authMiddleware');
const {
  getSettingPage,
  updateSetting,
} = require('../src/controllers/adminController/setting');

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
          '.webp',
      );
    },
  });
};

// Inisialisasi Multer dengan konfigurasi storage dinamis
const upload = (type) => multer({ storage: dynamicStorage(type) });

router.get('/', getDashboardPage);

router.get('/page', (req, res) => {
  res.render('admin/page/index', {
    session: req.session,
    title: 'Page',
    currentPage: 'admin-page',
    layout: './admin/layouts/layout',
  });
});

router.get('/page/add', (req, res) => {
  res.render('admin/page/add-page', {
    session: req.session,
    title: 'Add Page',
    currentPage: 'admin-add-page',
    layout: './admin/layouts/layout',
  });
});

router.get('/banner', getAllBanners);

router.get('/banner/add', getAddBanner);

router.post('/banner/add', upload('banners').single('ads_image'), addBanner);
router.get('/banner/edit/:banner_id', getBannerById);
router.post(
  '/banner/update/:banner_id',
  upload('banners').single('ads_image'),
  updateBanner,
);
router.get('/banner/delete/:banner_id', deleteBanner);

router.get('/users', getUser);
router.post('/users/add', addUser);

router.get('/cars', getCarsList);

router.get('/cars/add', getAddCar);

router.post('/cars/add', addCar);

router.get('/brands-name', getBrandsName);
router.get('/models-name/:brand_id', getModelName);
router.get('/generations-name/:model_id', getGenerationName);

router.get('/setting', getSettingPage);
router.post('/setting-update', updateSetting);

module.exports = router;
