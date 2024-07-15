const db = require('../../../db');
const query = require('../../store/query');
const nodecache = require('node-cache');

const cache = new nodecache();

exports.getCarsList = async (req, res) => {
  try {
    const key = req.originalUrl;
    const cachedData = cache.get(key);
    const brand_id = req.query.brand_id || '';

    if (cachedData) {
      return res.render('admin/car/index', {
        datas: cachedData,
        title: 'Cars List',
        currentPage: 'admin-car-list',
        layout: './admin/layouts/layout',
      });
    }

    const [cars] = await db.query(query.cars.getAllCars, [brand_id]);
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
      [`%${brand_name}%`]
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
    const model_name = req.query.q || '';
    const [datas] = await db.query(
      'SELECT id, name FROM models WHERE brand_id = ? AND  name LIKE ?',
      [brand_id, `%${model_name}%`]
    );

    return res.json({
      datas,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
exports.getGenerationName = async (req, res) => {
  try {
    const model_id = req.params.model_id;

    console.log(model_id);
    const [datas] = await db.query(
      'SELECT id, title as name FROM generations WHERE model_id = ?',
      [model_id]
    );

    return res.json({
      datas,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
exports.g;

exports.addCar = async (req, res) => {
  let connection;
  try {
    const {
      generation_id,
      brand_id,
      model_id,
      engine,
      start_production,
      end_production,
      powertrain_architecture,
      body_type,
      seat,
      door,
      fuel_consumption_urban,
      fuel_consumption_extraurban,
      fuel_type,
      acceleration_100kmh,
      acceleration_62mph,
      acceleration_60mph,
      maximum_speed,
      emission_standard,
      weight_to_power_ratio,
      weight_to_torque_ratio,
      power,
      power_per_litre,
      torque,
      engine_layout,
      engine_model,
      engine_displacement,
      number_cylinders,
      engine_configuration,
      cylinder_bore,
      piston_stroke,
      compression_ratio,
      number_valves_per_cylinder,
      fuel_injection_system,
      engine_aspiration,
      engine_oil_capacity,
      engine_oil_specification,
      coolant
    } = req.body;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const generalInformation = [
      null,
      engine,
      start_production,
      end_production,
      powertrain_architecture,
      body_type,
      seat,
      door,
    ];

    const performance_specs = [
      fuel_consumption_urban ?? '',
      fuel_consumption_extraurban ?? '',
      fuel_type ?? '',
      acceleration_100kmh ?? '',
      acceleration_62mph ?? '',
      acceleration_60mph ?? '',
      maximum_speed ?? '',
      emission_standard ?? '',
      weight_to_power_ratio ?? '',
      weight_to_torque_ratio ?? ''
    ]

    const engine_specs = [
      power ?? '',
      power_per_litre ?? '',
      torque ?? '',
      engine_layout ?? '',
      engine_model ?? '',
      engine_displacement ?? '',
      number_cylinders ?? '',
      engine_configuration ?? '',
      cylinder_bore ?? '',
      piston_stroke ?? '',
      compression_ratio ?? '',
      number_valves_per_cylinder ?? '',
      fuel_injection_system ?? '',
      engine_aspiration ?? '',
      engine_oil_capacity ?? '',
      engine_oil_specification ?? '',
      coolant ?? ''
    ]

    const gi = await connection.query(
      query.specs.addGeneralInformation,
      generalInformation
    );

    const ps = await connection.query(
      query.specs.addPerformanceSpecs, 
      performance_specs
    )

    const es = await connection.query(
      query.specs.addEngineSpecs,
      engine_specs
    )

    const inserCars = [generation_id, brand_id, model_id, gi[0].insertId, ps[0].insertId, es[0].insertId];

    await connection.query(
      'INSERT INTO cars(g_id, b_id, m_id, gi_id, ps_id, es_id) VALUES(?,?,?,?,?, ?)',
      inserCars
    );



    await connection.commit();

    res.redirect('/admin/cars');
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
