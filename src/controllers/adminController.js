const { DBquery } = require('../utils/database');

exports.getUser = async (req, res) => {
  try {
    const { res: data } = await DBquery('SELECT * FROM users');

    res.render('admin/user/index', {
      title: 'Manage User',
      currentPage: 'admin-user',
      layout: './admin/layouts/layout',
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.addUser = async (req, res) => {
  try {
    const { username, email, password, name, role, location } = req.body;

    await DBquery(
      'INSERT INTO users(username, email, password, name, role, location) VALUES (?,?,?,?,?,?)',
      [username, email, password, name, role, location]
    );

    res.status(201).json({
      message: 'sukses',
      data: req.body,
    });
  } catch (error) {
    next(error);
  }
};
