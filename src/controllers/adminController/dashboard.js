const query = require('../../store/query');
const { DBquery } = require('../../utils/database');

exports.getDashboardPage = async (req, res) => {
  try {
    const cars = await DBquery(query.dashboard.cars);

    const data = {
      cars: cars[0],
    };

    res.render('admin/index', {
      data,
      title: 'Dashboard Admin',
      currentPage: 'admin-index',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
