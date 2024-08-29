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

const apiservice = require("./api")
const router = express.Router();

router.get('/', getHomePage);

router.get('/brands', getAllBrands);
router.get('/brands/:brand_id/models', getModelByBrand);
router.get('/brands/models/:model_id/generations', getGenerationByModel);
router.get('/generation-list/:id', getGenerationLists);
router.get('/car-by-engine/:engine', getCarByEngine);
router.get('/specs/:id', getSpec);

router.get('/others', (req, res) => {
  res.render('other', { title: 'Halaman Lain', currentPage: 'others' });
});

router.get('/login', (req, res) => {
  res.render('auth/login', {
    errorMessage: req.query.errorMessage || '',
    title: 'Login',
    currentPage: 'login',
  });
});
router.get('/logout', logoutUser);

router.post('/users/register', addUser);
router.post('/login', loginUser);

router.get('/brands-name', getBrandsName);
router.get('/models-name/:brand_id', getModelName);
router.get('/generations-name/:model_id', getGenerationName);
router.get('/get-engine', getEngineName);

router.get('/privacy-policy', getPrivacyPolicy);

//api service
router.use('/api', apiservice);

module.exports = router;
