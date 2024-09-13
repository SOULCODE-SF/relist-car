const express = require('express');
const {
  getAllBrands,
  getModelByBrand,
  getGenerationByModel,
  getSpec,
  getGenerationLists,
  getHomePage,
  getPrivacyPolicy,
  getCarByEngine,
  getCarByBody,
  getContactUs,
  getListCountry,
  getAboutUs,
  getLearnMore,
  checkCar,
} = require('../src/controllers/indexController');
const {
  addUser,
  loginUser,
  logoutUser,
} = require('../src/controllers/authController');
const {
  getBrandsName,
  getModelName,
  getGenerationName,
  getEngineName,
} = require('../src/controllers/adminController/car/cars');

const apiservice = require('./api');
const { getCategoriesBlog } = require('../src/services/blogServices');
const router = express.Router();

router.get('/', getHomePage);

router.get('/countries', getListCountry);

router.get('/brands', getAllBrands);
router.get('/brands/:brand_name', getModelByBrand);
router.get('/brands/:brand_name/:model_name', getGenerationByModel);
router.get(
  '/brands/:brand_name/:model_name/:generation_name',
  getGenerationLists
);
router.get('/car-by-engine/:engine', getCarByEngine);
router.get('/car-by-body/:body', getCarByBody);
router.get('/brands/:brand_name/:model_name/:generation_name/:engine', getSpec);

router.get('/others', (req, res) => {
  res.render('other', { title: 'Halaman Lain', currentPage: 'others' });
});

router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    currentPage: 'login',
  });
});
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'register',
    currentPage: 'register',
  });
});
router.get('/logout', logoutUser);

router.post('/auth/register', addUser);
router.post('/login', loginUser);

router.get('/brands-name', getBrandsName);
router.get('/models-name/:brand_id', getModelName);
router.get('/generations-name/:model_id', getGenerationName);
router.get('/get-engine', getEngineName);

router.get('/privacy-policy', getPrivacyPolicy);
router.get('/contact-us', getContactUs);
router.get('/about-us', getAboutUs);
router.get('/learn-more', getLearnMore);

router.get('/check-car', checkCar);

//api service
router.use('/api', apiservice);

router.use('/blog/categories', getCategoriesBlog)

module.exports = router;
