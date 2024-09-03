require('dotenv').config();

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const logger = require('morgan');
const compression = require('compression');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const siteInfoMiddleware = require('./src/middlewares/siteMiddleware');
const {
  isAuthenticated,
  isAdmin,
} = require('./routes/middlewares/authMiddleware');

const app = express();

const adsTxtPath = path.join(__dirname, 'public', 'ads.txt');

app.get('/ads.txt', (req, res) => {
  res.sendFile(adsTxtPath);
});

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(
  session({
    secret: `${process.env.SECRET_KEY}`,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(siteInfoMiddleware);
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

// Routes
const router = require('./routes');
const adminRouter = require('./routes/admin');

app.use(router);
app.use('/admin', isAuthenticated, isAdmin, adminRouter);

app.use((err, req, res, next) => {
  console.log(err);
  console.error(err.stack);
  res.status(500).render('500', { currentPage: 'error' });
});

module.exports = app;
