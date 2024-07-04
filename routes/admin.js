const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const { getUser } = require('../src/controllers/adminController');

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

router.get('/banner', (req, res) => {
  res.render('admin/banner/index', {
    title: 'Banner List',
    currentPage: 'admin-banner',
    layout: './admin/layouts/layout',
  });
});

router.get('/banner/add', (req, res) => {
  res.render('admin/banner/add', {
    title: 'Add Banner',
    currentPage: 'admin-add-banner',
    layout: './admin/layouts/layout',
  });
});

router.get('/users', getUser);

module.exports = router;
