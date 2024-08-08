const queryStore = require('../store/query');
const query = require('../store/query');
const nodecache = require('node-cache');
const { DBquery } = require('../utils/database');

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

    const recentCars = await DBquery(query.home.recentCars, [15]);

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

    const datas = await DBquery(query.brands.getAllBrands, [`%${searchTerm}%`]);

    cache.set(key, datas, 86000);

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

    const datas = await DBquery(query.models.getModelByBrand, [brand_id]);

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

    const datas = await DBquery(query.generations.getGenerationByModelQuery, [
      model_id,
    ]);

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
    const datas = await DBquery(queryStore.generations.list, [generation_id]);

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

    const datas = await DBquery('CALL get_spec(?)', [carId]);

    const data = datas[0][0];
    let haveElectricMotor = false;
    if (data.electric_motor_1_power != '') {
      haveElectricMotor = true;
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
    };

    console.log(jsonData);

    res.render('specs', {
      data: jsonData,
      title: 'Spec',
      currentPage: 'specs',
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.getPrivacyPolicy = async (req, res) => {
  res.render('privacy_policy', {
    title: 'Privacy Policy',
    currentPage: 'privacy-policy',
  });

  try {
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};
