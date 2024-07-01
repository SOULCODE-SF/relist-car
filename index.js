const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.use(expressLayouts);
app.set('layout', './layouts/layout');
// Set EJS as the view engine
app.set('view engine', 'ejs');

// Specify the directory for views
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

var router = require('./routes');

app.use(router);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
