const db = require('../../../db');
const query = require('../../store/query');

exports.getDashboardPage = async (req, res) => {
  try {
    const [cars] = await db.query(query.dashboard.cars);

    const data = {
      cars: cars[0],
    };

    res.render('admin/index', {
      data,
      session: req.session,
      title: 'Dashboard Admin',
      currentPage: 'admin-index',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
