const express = require('express');
const {
  getAllBrands,
  getModelByBrand,
  getGenerationByModel,
  getSpec,
  getGenerationLists,
  getHomePage,
} = require('../src/controllers/indexController');
const router = express.Router();

router.get('/', getHomePage);

// Tambahkan rute untuk brands.ejs
router.get('/brands', getAllBrands);

router.get('/models', (req, res) => {
  const modelsQuery =
    'SELECT m.id, m.title, m.image, b.name FROM models m JOIN brands b on b.id = m.brand_id';
  connection.query(modelsQuery, (err, modelResults) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.render('models', {
      models: modelResults,
      title: `Models`,
      currentPage: 'models',
    });
  });
});

router.get('/brands/:brand_id/models', getModelByBrand);

router.get('/brands/models/:model_id/generations', getGenerationByModel);

router.get('/generation-list/:id', getGenerationLists);
router.get('/specs/:id', getSpec);

router.get('/others', (req, res) => {
  res.render('other', { title: 'Halaman Lain', currentPage: 'others' });
});

module.exports = router;
