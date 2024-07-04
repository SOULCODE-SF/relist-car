const db = require('../../db');

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
