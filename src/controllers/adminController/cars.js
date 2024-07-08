const db = require('../../../db');
const query = require('../../store/query');
const nodecache = require('node-cache');

const cache = new nodecache();

exports.getCarsList = async (req, res) => {
  try {
    const key = req.originalUrl;
    const cachedData = cache.get(key);

    if (cachedData) {
      return res.render('admin/car/index', {
        datas: cachedData,
        title: 'Cars List',
        currentPage: 'admin-car-list',
        layout: './admin/layouts/layout',
      });
    }

    const [cars] = await db.query(query.cars.getAllCars);
    const datas = cars;
    cache.set(key, datas, 3600);

    res.render('admin/car/index', {
      datas,
      title: 'Cars List',
      currentPage: 'admin-car-list',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
exports.getBrandsName = async (req, res) => {
  try {
    const brand_name = req.query.q || '';

    const [datas] = await db.query(
      'SELECT id, name FROM brands WHERE name LIKE ?',
      [`%${brand_name[1]}%`]
    );

    return res.json({
      datas,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getModelName = async (req, res) => {
  try {
    const brand_id = req.params.brand_id;
    const [datas] = await db.query(
      'SELECT id, name FROM models WHERE brand_id = ?',
      [brand_id]
    );

    return res.json({
      datas,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.addCar = async (req, res) => {
  try {
    const {
      brand_name,
      model_name,
      engine,
      start_production,
      end_production,
      powertrain_architecture,
      body_type,
      seat,
      door,
    } = req.body;

    const data = { input: req.body };
    console.log(data);
    return res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
