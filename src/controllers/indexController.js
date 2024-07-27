const db = require('../../db');
const queryStore = require('../store/query');
const query = require('../store/query');
const nodecache = require('node-cache');

const cache = new nodecache();

function isValid(value) {
  return value !== null && value !== undefined && value.trim() !== '';
}

exports.getHomePage = async (req, res) => {
  try {
    const key = req.originalUrl;
    const cachedData = cache.get(key);

    if (cachedData) {
      return res.render('index', {
        recentCars: cachedData.recentCars,
        title: 'Home',
        currentPage: 'homes',
      });
    }

    const [recentCars] = await db.query(query.home.recentCars, [15]);

    let datas = {
      recentCars,
    };

    cache.set(key, datas, 3600);

    res.render('index', {
      recentCars: recentCars,
      title: 'Home',
      currentPage: 'homes',
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const key = req.originalUrl;
    const cachedData = cache.get(key);

    let searchTerm = req.query.q || '';

    if (cachedData) {
      return res.render('brands', {
        brands: cachedData,
        title: 'Brands Lists',
        currentPage: 'brands',
        searchTerm: searchTerm,
      });
    }

    const [datas] = await db.query(query.brands.getAllBrands, [
      `%${searchTerm}%`,
    ]);

    cache.set(key, datas, 3600);

    res.render('brands', {
      brands: datas,
      title: 'Brands Lists',
      currentPage: 'brands',
      searchTerm: searchTerm,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};

//models
exports.getModelByBrand = async (req, res) => {
  try {
    let brand_id = req.params.brand_id;

    const [datas] = await db.query(query.models.getModelByBrand, [brand_id]);

    res.render('models', {
      models: datas,
      title: 'Models',
      currentPage: 'models',
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.getGenerationByModel = async (req, res) => {
  try {
    let model_id = req.params.model_id;

    const [datas] = await db.query(
      query.generations.getGenerationByModelQuery,
      [model_id],
    );

    res.render('generations', {
      generations: datas,
      title: 'Generations',
      currentPage: 'generations',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getGenerationLists = async (req, res) => {
  try {
    let generation_id = req.params.id;
    const [datas] = await db.query(queryStore.generations.list, [
      generation_id,
    ]);

    console.log(datas[0]);

    res.render('generations_list', {
      datas: datas,
      title: 'List Generation',
      currentPage: 'list-generation',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getSpec = async (req, res) => {
  try {
    let carId = req.params.id;

    const [datas] = await db.query('CALL get_spec(?)', [carId]);

    console.log(datas[0][0]);
    const data = datas[0][0];

    const jsonData = {
      engine_spec: {
        power: data.power,
        power_per_litre: data.power_per_litre,
        engine_layout: data.engine_layout,
        engine_model: data.engine_model,
        engine_displacement: data.engine_displacement,
        number_cylinders: data.number_cylinders,
        engine_configuration: data.engine_configuration,
        number_valves_per_cylinder: data.number_valves_per_cylinder,
        fuel_injection_system: data.fuel_injection_system,
        engine_aspiration: data.engine_aspiration,
        engine_system: data.engine_system,
        coolant: data.coolant,
      },
    };

    const hasData = {
      engine_spec:
        isValid(data.power) ||
        isValid(data.power_per_litre) ||
        isValid(data.engine_layout) ||
        isValid(data.engine_model) ||
        isValid(data.engine_displacement) ||
        isValid(data.number_cylinders) ||
        isValid(data.engine_configuration) ||
        isValid(data.number_valves_per_cylinder) ||
        isValid(data.fuel_injection_system) ||
        isValid(data.engine_aspiration) ||
        isValid(data.engine_system) ||
        isValid(data.coolant),
      performance_specs: isValid(data.some_performance_spec_column),
    };
    res.render('specs', {
      data: datas[0][0],
      jsonData,
      hasData,
      title: 'Spec',
      currentPage: 'specs',
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};
