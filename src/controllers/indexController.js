const queryStore = require('../store/query');
const axios = require('axios');
const query = require('../store/query');
const nodecache = require('node-cache');
const { DBquery } = require('../utils/database');
const { revertParam } = require('../utils/carHelpers');

const cache = new nodecache();

function isValid(value) {
  return value !== null && value !== undefined && value.trim() !== '';
}

var querystr = '',
  queryvalue = [];

const getHomePage = async (req, res, next) => {
  try {
    const key = req.originalUrl;
    const cachedData = cache.get(key);

    if (cachedData) {
      return res.render('index', {
        datas: cachedData,
        title: 'Home',
        currentPage: 'homes',
      });
    }

    querystr = 'SELECT COUNT(id) as total FROM cars';
    const carsCount = await DBquery(querystr);

    const totalCar = carsCount[0].total;

    querystr = 'SELECT count(id) as total FROM brands';
    const brandsCount = await DBquery(querystr);

    const totalBrand = brandsCount[0].total;

    const recentCars = await DBquery(query.home.recentCars, [12]);

    querystr = `SELECT *, LOWER(name) AS param FROM brands WHERE is_featured = 1 LIMIT 39`;
    const brands = await DBquery(querystr);

    const allbrand = {
      id: 'all-brand',
      name: 'All brands',
      image_path: '/assets/images/brands/allbrand.webp',
      is_featured: 1,
    };
    brands.unshift(allbrand);

    querystr = `SELECT DISTINCT 
                SUBSTRING_INDEX(gi.body_type, ',', 1) AS body,
                LOWER(REPLACE(TRIM(SUBSTRING_INDEX(gi.body_type, ',', 1)), ' ', '-')) AS param,
                ci.image_path
                FROM cars c 
                JOIN general_information gi ON c.gi_id = gi.id 
                LEFT JOIN (SELECT car_id, MIN(image_path) AS image_path FROM car_images GROUP BY car_id) ci ON c.id = ci.car_id
                WHERE TRIM(SUBSTRING_INDEX(gi.body_type, ',', 1)) != '' AND TRIM(SUBSTRING_INDEX(gi.body_type, ',', 1)) IS NOT NULL
                GROUP BY SUBSTRING_INDEX(gi.body_type, ',', 1);
                `;

    const bodyType = await DBquery(querystr);

    let datas = {
      totalCar,
      totalBrand,
      brands,
      recentCars,
      bodyType,
    };

    cache.set(key, datas, 3600);

    res.render('index', {
      datas: datas,
      title: 'Home',
      currentPage: 'homes',
    });
  } catch (error) {
    next(error);
  }
};
const getAllBrands = async (req, res, next) => {
  try {
    const key = req.originalUrl;
    const cachedData = cache.get(key);

    let searchTerm = req.query.q || '';

    if (cachedData) {
      return res.render('cars/brands', {
        brands: cachedData,
        title: 'Brands Lists',
        currentPage: 'brands',
        searchTerm: searchTerm,
      });
    }

    const datas = await DBquery(query.brands.getAllBrands, [`%${searchTerm}%`]);

    cache.set(key, datas, 86000);

    res.render('cars/brands', {
      brands: datas,
      title: 'Brands Lists',
      currentPage: 'brands',
      searchTerm: searchTerm,
    });
  } catch (error) {
    next(error);
  }
};

//models
const getModelByBrand = async (req, res, next) => {
  try {
    let brand_name = req.params.brand_name;

    const datas = await DBquery(query.models.getModelByBrand, [brand_name]);

    res.render('cars/models', {
      models: datas,
      title: 'Models',
      currentPage: 'models',
    });
  } catch (error) {
    next(error);
  }
};

const getGenerationByModel = async (req, res, next) => {
  try {
    let model_name = req.params.model_name;

    model_name = revertParam(model_name);

    const datas = await DBquery(query.generations.getGenerationByModelQuery, [
      model_name,
    ]);

    res.render('cars/generations', {
      generations: datas,
      title: 'Generations',
      currentPage: 'generations',
    });
  } catch (error) {
    next(error);
  }
};

const getGenerationLists = async (req, res, next) => {
  try {
    let generation_name = req.params.generation_name;

    generation_name = revertParam(generation_name);

    const datas = await DBquery(queryStore.generations.list, [generation_name]);

    res.render('cars/generations_list', {
      datas: datas,
      title: 'List Generation',
      currentPage: 'list-generation',
    });
  } catch (error) {
    next(error);
  }
};

const getSpec = async (req, res, next) => {
  try {
    let generation = req.params.generation_name;
    generation = revertParam(generation);
    let engine = req.params.engine;

    const datas = await DBquery('CALL get_spec(?, ?)', [engine, generation]);
    const data = datas[0][0];
    const imagescar = await DBquery(
      'SELECT image_path FROM car_images WHERE car_id = ?',
      [data.car_id]
    );
    let haveElectricMotor = false;
    if (data.electric_motor_1_power != '') {
      haveElectricMotor = true;
    }

    function hasNonEmptyValue(obj) {
      return Object.values(obj).some(
        (value) => value !== '' && value !== null && value !== undefined
      );
    }

    const jsonData = {
      general_information: {
        car_id: data.car_id,
        brand_id: data.brand_id,
        model_id: data.model_id,
        generation_id: data.generation_id,
        brand_name: data.brand_name,
        model_name: data.model_name,
        generation_name: data.generation_name,
        engine: data.engine,
        start_production: data.start_production,
        end_production: data.end_production,
        powertrain_architecture: data.powertrain_architecture,
        body_type: data.body_type,
        seat: data.seat,
        door: data.door,
      },
      performance_spec: {
        fuel_consumption_urban: data.fuel_consumption_urban,
        fuel_consumption_extra_urban: data.fuel_consumption_extra_urban,
        fuel_consumption_combined: data.fuel_consumption_combined,
        co2_emmission: data.co2_emmission,
        fuel_type: data.fuel_type,
        acceleration_100kmh: data.acceleration_100kmh,
        acceleration_62mph: data.acceleration_62mph,
        acceleration_60mph: data.acceleration_60mph,
        maximum_speed: data.maximum_speed,
        emission_standard: data.emission_standard,
        weight_power_ratio: data.weight_power_ratio,
        weight_power_torque: data.weight_power_torque,
      },
      engine_spec: {
        power: data.power,
        power_per_litre: data.power_per_litre,
        torque: data.torque,
        engine_layout: data.engine_layout,
        engine_model: data.engine_model,
        engine_displacement: data.engine_displacement,
        number_cylinders: data.number_cylinders,
        engine_configuration: data.engine_configuration,
        cylinder_bore: data.cylinder_bore,
        piston_stroke: data.piston_stroke,
        compression_ratio: data.compression_ratio,
        number_valves_per_cylinder: data.number_valves_per_cylinder,
        fuel_injection_system: data.fuel_injection_system,
        engine_aspiration: data.engine_aspiration,
        engine_oil_capacity: data.engine_oil_capacity,
        engine_oil_specification: data.engine_oil_specification,
        engine_system: data.engine_system,
        coolant: data.coolant,
      },
      dimension: {
        length: data.length,
        width: data.width,
        height: data.height,
        wheelbase: data.wheelbase,
        front_track: data.front_track,
        rear_back_track: data.rear_back_track,
        front_overhang: data.front_overhang,
        rear_overhang: data.rear_overhang,
        minimum_turning_circle: data.minimum_turning_circle,
      },
      space: {
        kerb_weight: data.kerb_weight,
        trunk_space_minimum: data.trunk_space_minimum,
        trunk_space_maximum: data.trunk_space_maximum,
        max_load: data.max_load,
        fuel_tank_capacity: data.fuel_tank_capacity,
        permitted_trailer_load_with_brakes:
          data.permitted_trailer_load_with_brakes,
        permitted_trailer_load_without_brakes:
          data.permitted_trailer_load_without_brakes,
        permitted_towbardownload: data.permitted_towbardownload,
      },
      electric: {
        battery_capacity: data.battery_capacity,
        battery_technology: data.battery_technology,
        battery_location: data.battery_location,
        all_electric_range: data.all_electric_range,
        charging_ports: data.charging_ports,
        haveElectricMotor,
        electric_motor: [
          {
            power: data.electric_motor_1_power,
            torque: data.electric_motor_1_torque,
            location: data.electric_motor_1_location,
            type: data.electric_motor_1_type,
          },
          {
            power: data.electric_motor_2_power,
            torque: data.electric_motor_2_torque,
            location: data.electric_motor_2_location,
            type: data.electric_motor_2_type,
          },
        ],
        system_power: data.system_power,
        system_torque: data.system_torque,
      },
      drivetrain: {
        drivetrain_architecture: data.drivetrain_architecture,
        drive_wheel: data.drive_wheel,
        number_of_gears_and_type_of_gearbox:
          data.number_of_gears_and_type_of_gearbox,
        front_suspension: data.front_suspension,
        rear_suspension: data.rear_suspension,
        front_brakes: data.front_brakes,
        rear_brakes: data.rear_brakes,
        assisting_systems: data.assisting_systems,
        tires_size: data.tires_size,
        wheel_rims_size: data.wheel_rims_size,
      },
      images: imagescar,
    };

    const value = {
      is_general_information: hasNonEmptyValue(jsonData.general_information),
      is_performance_spec: hasNonEmptyValue(jsonData.performance_spec),
      is_engine_spec: hasNonEmptyValue(jsonData.engine_spec),
      is_dimension_spec: hasNonEmptyValue(jsonData.dimension),
      is_space_spec: hasNonEmptyValue(jsonData.space),
      is_electric_spec: hasNonEmptyValue(jsonData.electric),
      is_drivetrain_spec: hasNonEmptyValue(jsonData.drivetrain),
    };

    res.render('cars/specs', {
      data: jsonData,
      value,
      title: 'Spec',
      currentPage: 'specs',
    });
  } catch (error) {
    next(error);
  }
};

const getCarByEngine = async (req, res, next) => {
  try {
    let engine = req.params.engine;

    querystr = `SELECT c.id, gi.engine,g.title,gi.body_type,(SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) as image
              FROM cars c JOIN generations g ON c.g_id = g.id JOIN general_information gi ON c.gi_id = gi.id WHERE gi.engine = ? GROUP BY g.title, gi.body_type;`;
    queryvalue = [engine];

    const datas = await DBquery(querystr, queryvalue);

    return res.render('cars/car_by_engine', {
      datas,
      title: 'Car by Engine',
      currentPage: 'car_by_engine',
    });
  } catch (error) {
    next(error);
  }
};

function formatParam(text) {
  let result = text.replace(/-/g, ' ');
  result = result.replace(/\b\w/g, (char) => char.toUpperCase());

  return result;
}

const getCarByBody = async (req, res, next) => {
  try {
    const body = req.params.body;

    const param = formatParam(body);

    querystr = `SELECT c.id, gi.engine,g.title,gi.body_type,(SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) as image
              FROM cars c JOIN generations g ON c.g_id = g.id JOIN general_information gi ON c.gi_id = gi.id WHERE (gi.body_type LIKE ? OR gi.body_type LIKE ?) GROUP BY g.title, gi.body_type;`;
    queryvalue = [`%${param}%`, `%${body}%`];

    const datas = await DBquery(querystr, queryvalue);

    const data = {
      datas,
      body: param,
    };

    return res.render('cars/car_by_body', {
      data,
      title: 'Car by Body',
      currentPage: 'car_by_body',
    });
  } catch (error) {
    next(error);
  }
};

const getPrivacyPolicy = async (req, res, next) => {
  try {
    res.render('privacy_policy', {
      title: 'Privacy Policy',
      currentPage: 'privacy-policy',
    });
  } catch (error) {
    next(error);
  }
};

const getContactUs = async (req, res, next) => {
  try {
    res.render('contact_us', {
      title: 'Contact Us',
      currentPage: 'contact-us',
    });
  } catch (error) {
    next(error);
  }
};

const getAboutUs = async (req, res, next) => {
  try {
    res.render('about_us', {
      title: 'About Us',
      currentPage: 'about-us',
    });
  } catch (error) {
    next(error);
  }
};

const getLearnMore = async (req, res, next) => {
  try {
    res.render('learn_more', {
      title: 'Learn More',
      currentPage: 'learn-more',
    });
  } catch (error) {
    next(error);
  }
};

const getListCountry = async (req, res, next) => {
  try {
    const name = req.query.q || '';

    const response = await axios.get('https://api.first.org/data/v1/countries');
    let countryData = response.data.data;
    const countries = Object.keys(countryData).map((key) => ({
      code: countryData[key].country,
      name: countryData[key].country,
    }));

    if (name) {
      const filteredCountries = countries.filter((country) =>
        country.name.toLowerCase().includes(name.toLowerCase())
      );
      res.json({ data: filteredCountries });
    } else {
      res.json({ data: countries });
    }
  } catch (error) {
    next(error);
  }
};

const checkCar = async (req, res, next) => {
  try {
    const url = req.query.url;

    const segments = url.split('/');
    let engine = segments[segments.length - 1];
    let generation = segments[segments.length - 2];
    generation = revertParam(generation);

    const data = await DBquery('CALL get_spec(?, ?)', [engine, generation]);

    if (data[0][0] == undefined) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Specifications are not yet available for this car model',
      };

      return res.json({ url: url });
    } else {
      return res.json({ url: '/hola' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomePage,
  getAllBrands,
  getModelByBrand,
  getGenerationByModel,
  getGenerationLists,
  getSpec,
  getPrivacyPolicy,
  getCarByEngine,
  getCarByBody,
  getContactUs,
  getAboutUs,
  getLearnMore,
  getListCountry,
  checkCar,
};
