const db = require('../../db');
const query = require('../store/query');

exports.getUser = async (req, res) => {
  try {
    const [data] = await db.query('SELECT * FROM users');

    res.render('admin/user/index', {
      title: 'Manage User',
      currentPage: 'admin-user',
      layout: './admin/layouts/layout',
      data,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.addUser = async (req, res) => {
  try {
    const { username, email, password, name, role, location } = req.body;

    await db.query(
      'INSERT INTO users(username, email, password, name, role, location) VALUES (?,?,?,?,?,?)',
      [username, email, password, name, role, location]
    );

    res.status(201).json({
      message: 'sukses',
      data: req.body,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};
