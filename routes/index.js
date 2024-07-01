const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'myuser',
  password: 'myuser',
  database: 'db_car_specs',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database!');
});

// Route untuk halaman index
router.get('/', (req, res) => {
  res.render('index', { title: 'Home', currentPage: 'home' });
});

// Tambahkan rute untuk brands.ejs
router.get('/brands', (req, res) => {
  let searchTerm = req.query.q || '';

  const query = `SELECT id, name, image FROM brands WHERE name LIKE '%${searchTerm}%'`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.render('brands', {
      brands: results,
      title: 'Daftar Merek Mobil',
      currentPage: 'brands',
      searchTerm: searchTerm,
    });
  });
});

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

router.get('/brands/:id/models', (req, res) => {
  const brandId = req.params.id;

  const modelsQuery =
    'SELECT m.id, m.title, m.image , b.name FROM models m JOIN brands b on b.id = m.brand_id WHERE m.brand_id = ?';
  connection.query(modelsQuery, [brandId], (err, modelResults) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.render('models', {
      brandId: brandId,
      models: modelResults,
      title: `Models`,
      currentPage: 'models',
    });
  });
});

router.get('/brands/models/:id/generations', (req, res) => {
  const modelId = req.params.id;

  const modelsQuery =
    'SELECT g.* ,m.title as model_title, b.name as brand_title, b.id as brand_id from generations g join models m on g.model_id = m.id JOIN brands b on b.id = m.brand_id where m.id = ?';
  connection.query(modelsQuery, [modelId], (err, result) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.render('generations', {
      modelId: modelId,
      generations: result,
      title: `Generations`,
      currentPage: 'generations',
    });
  });
});

router.get('/others', (req, res) => {
  res.render('other', { title: 'Halaman Lain', currentPage: 'others' });
});

module.exports = router;
