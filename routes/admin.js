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
  getEditCar,
  updateCar,
  deleteCar,
} = require('../src/controllers/adminController/car/cars');
const {
  getDashboardPage,
} = require('../src/controllers/adminController/dashboard');
const { isAuthenticated, isAdmin } = require('./middlewares/authMiddleware');
const {
  getSettingPage,
  updateSetting,
} = require('../src/controllers/adminController/setting');
const { getAllBrands } = require('../src/controllers/indexController');
const {
  getAllListBrands,
  getAddBrands,
  addBrands,
  getEditBrands,
  editBrands,
  deleteBrands,
} = require('../src/controllers/adminController/car/brand');
const {
  getAllModelList,
  getAddModel,
  addModel,
  getEditModel,
  editModels,
  deleteModel,
} = require('../src/controllers/adminController/car/model');
const {
  getAllGenerationList,
  addGeneration,
  getAddGeneration,
  getEditGenaration,
  editGenerations,
  deleteGeneration,
} = require('../src/controllers/adminController/car/generation');
const uploadCarImages = require('../src/utils/carimage');

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

const upload = (type, fieldname) => {
  return (req, res, next) => {
    const uploadMiddleware = multer({
      storage: dynamicStorage(type),
      limits: { fileSize: 600 * 1024 },
    }).single(fieldname);

    uploadMiddleware(req, res, function (err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).send('File size exceeds the limit of 600KB');
        }
        return res.status(500).send('An error occurred during file upload');
      }
      next();
    });
  };
};

router.get('/', getDashboardPage);

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

router.get('/banner/add', getAddBanner);

router.post('/banner/add', upload('temp', 'ads_image'), addBanner);
router.get('/banner/edit/:id', getBannerById);
router.post('/banner/update/:id', upload('temp', 'ads_image'), updateBanner);
router.get('/banner/delete/:banner_id', deleteBanner);

router.get('/users', getUser);
router.post('/users/add', addUser);
router.get('/cars', getCarsList);
router.get('/cars/add', getAddCar);
router.post('/cars/add', uploadCarImages.array('images', 10), addCar);
router.get('/cars/update/:id', getEditCar);
router.post('/cars/update/:id', updateCar);
router.get('/cars/delete/:id', deleteCar);

//brands router
router.get('/cars-brands', getAllListBrands);
router.get('/add-brands', getAddBrands);
router.post('/add-brands', upload('brands', 'brand_image'), addBrands);
router.get('/edit-brands/:id', getEditBrands);
router.post('/edit-brands/:id', upload('brands', 'brand_image'), editBrands);
router.get('/delete-brands/:id', deleteBrands);

//models router
router.get('/brand-models', getAllModelList);
router.get('/add-models', getAddModel);
router.post('/add-models', upload('models', 'model_image'), addModel);
router.get('/edit-models/:id', getEditModel);
router.post('/edit-models/:id', upload('models', 'model_image'), editModels);
router.get('/delete-models/:id', deleteModel);

//generations router
router.get('/model-generations', getAllGenerationList);
router.get('/add-generations', getAddGeneration);
router.post(
  '/add-generations',
  upload('generations', 'generation_image'),
  addGeneration,
);
router.get('/edit-generations/:id', getEditGenaration);
router.post(
  '/edit-generations/:id',
  upload('generations', 'generation_image'),
  editGenerations,
);
router.get('/delete-generations/:id', deleteGeneration);

router.get('/brands-name', getBrandsName);
router.get('/models-name/:brand_id', getModelName);
router.get('/generations-name/:model_id', getGenerationName);

router.get('/setting', getSettingPage);
router.post('/setting', updateSetting);

module.exports = router;
