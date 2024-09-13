const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uploadCarImages = require('../src/utils/carImage');

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
const {
  getSettingPage,
  updateSetting,
} = require('../src/controllers/adminController/setting');
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
const {
  getUserPage,
  getAddUsersPage,
  addUsers,
  editUsers,
  getEditUsersPage,
  deleteUsers,
} = require('../src/controllers/adminController/users');
const {
  getAllPosts,
  getAllCategories,
  getAddCategories,
  addCategories,
  getUpdateCategories,
  updateCategories,
  deleteCategories,
  getAddPosts,
  addPosts,
  getEditPosts,
  editPosts,
  deletePosts,
} = require('../src/controllers/adminController/blogs');
const {
  addCustomPage,
  getAllPages,
  getEditPage,
  editCustomPage,
  deleteCustomPage,
} = require('../src/controllers/adminController/pages');

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

const upload = (type, fields) => {
  let uploadMiddleware;
  return (req, res, next) => {
    if (!Array.isArray(fields)) {
      uploadMiddleware = multer({
        storage: dynamicStorage(type),
        limits: { fileSize: 600 * 1024 },
      }).single(fields);
    } else {
      uploadMiddleware = multer({
        storage: dynamicStorage(type),
        limits: { fileSize: 600 * 1024 },
      }).fields(fields);
    }

    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.log(err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).send('File size exceeds the limit of 600KB');
        }
        console.error(err);
        return res.status(500).send('An error occurred during file upload');
      }
      next();
    });
  };
};

router.get('/', getDashboardPage);

router.get('/pages', getAllPages);

router.get('/add-pages', (req, res) => {
  res.render('admin/page/add-page', {
    data: {},
    title: 'Add Page',
    currentPage: 'admin-add-page',
    layout: './admin/layouts/layout',
  });
});

router.post('/add-pages', upload('temp', 'page_image'), addCustomPage);
router.get('/edit-pages/:id', getEditPage);
router.post('/edit-pages/:id', upload('temp', 'page_image'), editCustomPage);
router.get('/delete-pages/:id', deleteCustomPage);

router.get('/banner', getAllBanners);

router.get('/banner/add', getAddBanner);

router.post('/banner/add', upload('temp', 'ads_image'), addBanner);
router.get('/banner/edit/:id', getBannerById);
router.post('/banner/update/:id', upload('temp', 'ads_image'), updateBanner);
router.get('/banner/delete/:banner_id', deleteBanner);

router.get('/cars', getCarsList);
router.get('/cars/add', getAddCar);
const carImages = [{ name: 'car_images', maxCount: 5 }];
router.post('/cars/add', upload('temp', carImages), addCar);
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
  addGeneration
);
router.get('/edit-generations/:id', getEditGenaration);
router.post(
  '/edit-generations/:id',
  upload('generations', 'generation_image'),
  editGenerations
);
router.get('/delete-generations/:id', deleteGeneration);

router.get('/brands-name', getBrandsName);
router.get('/models-name/:brand_id', getModelName);
router.get('/generations-name/:model_id', getGenerationName);

router.get('/setting', getSettingPage);
const fieldsSetting = [
  { name: 'site_logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
];

router.post('/setting', upload('temp', fieldsSetting), updateSetting);

//users
router.get('/users', getUserPage);
router.get('/add-users', getAddUsersPage);
router.post('/add-users', addUsers);
router.get('/update-users/:id', getEditUsersPage);
router.post('/update-users/:id', editUsers);
router.get('/delete-users/:id', deleteUsers);

//blogs
router.get('/blog/posts', getAllPosts);
router.get('/blog/add-posts', getAddPosts);
router.post('/blog/add-posts', upload('temp', 'post_image'), addPosts);
router.get('/blog/edit-posts/:id', getEditPosts);
router.post('/blog/edit-posts/:id', upload('temp', 'post_image'), editPosts);
router.get('/blog/delete-posts/:id', deletePosts);

router.get('/blog/categories', getAllCategories);
router.get('/blog/add-categories', getAddCategories);
router.post('/blog/add-categories', addCategories);
router.get('/blog/edit-categories/:id', getUpdateCategories);
router.post('/blog/edit-categories/:id', updateCategories);
router.get('/blog/delete-categories/:id', deleteCategories);

module.exports = router;
