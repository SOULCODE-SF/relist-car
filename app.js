const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const logger = require('morgan');
const compression = require('compression');

const app = express();

app.use(expressLayouts);
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('layout', './layouts/layout');

// Specify the directory for views
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Helmet middleware with CSP configuration
var router = require('./routes');
var adminRouter = require('./routes/admin');

app.use(router);
app.use('/admin', adminRouter);

module.exports = app;
