const express = require('express');
const {
  getAllBrands,
  getModelByBrand,
  getGenerationByModel,
  getSpec,
  getGenerationLists,
  getHomePage,
} = require('../src/controllers/indexController');
const { addUser, loginUser } = require('../src/controllers/authController');
const router = express.Router();

router.get('/', getHomePage);

router.get('/brands', getAllBrands);

router.get('/brands/:brand_id/models', getModelByBrand);

router.get('/brands/models/:model_id/generations', getGenerationByModel);

router.get('/generation-list/:id', getGenerationLists);
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
router.post('/users/register', addUser);
router.post('/login', loginUser);

module.exports = router;
