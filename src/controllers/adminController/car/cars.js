const nodecache = require('node-cache');
const queryStore = require('../../../store/query');
const {
  DBquery,
  getConnection,
  releaseConnection,
  rollbackTransaction,
  commitTransaction,
} = require('../../../utils/database');
const {
  getBrandNameById,
  getModelNameById,
  getGenerationNameById,
} = require('../../../utils/carHelpers');

const cache = new nodecache();

exports.getCarsList = async (req, res, next) => {
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

    const cars = await DBquery(queryStore.cars.getAllCars, [brand_id]);

    const datas = cars;

    cache.set(key, datas, 3600);

    res.render('admin/car/index', {
      datas,
      title: 'Cars List',
      currentPage: 'admin-car-list',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};
exports.getBrandsName = async (req, res, next) => {
  try {
    const brand_name = req.query.q || '';

    const datas = await DBquery(
      'SELECT id, name FROM brands WHERE name LIKE ?',
      [`%${brand_name}%`],
    );

    return res.json({
      datas,
    });
  } catch (error) {
    next(error);
  }
};

exports.getModelName = async (req, res, next) => {
  try {
    const brand_id = req.params.brand_id;
    const model_name = req.query.q || '';
    const datas = await DBquery(
      'SELECT id, name FROM models WHERE brand_id = ? AND  name LIKE ?',
      [brand_id, `%${model_name}%`],
    );

    return res.json({
      datas,
    });
  } catch (error) {
    next(error);
  }
};

exports.getGenerationName = async (req, res, next) => {
  try {
    const model_id = req.params.model_id;

    console.log(model_id);
    const datas = await DBquery(
      'SELECT id, title as name FROM generations WHERE model_id = ?',
      [model_id],
    );

    return res.json({
      datas,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEngineName = async (req, res, next) => {
  try {
    const search = req.query.search;

    console.log('search',search);

    let querystr = `SELECT gi.engine as name FROM general_information gi `;
    if (search) {
      querystr += ` WHERE gi.engine LIKE ? `;
    }
    querystr += `GROUP BY gi.engine LIMIT 100`;

    const datas = await DBquery(querystr, [`%${search}%`]);

    datas.unshift({ name: 'None' },)
    return res.json({
      datas,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddCar = async (req, res, next) => {
  try {
    const powertrain_architecture = await DBquery(`
      SELECT DISTINCT powertrain_architecture
      FROM general_information
      WHERE powertrain_architecture IS NOT NULL
        AND TRIM(powertrain_architecture) <> ''
    `);

    res.render('admin/car/add', {
      data: {
        powertrain_architecture,
      },
      title: 'Car Add',
      currentPage: 'admin-car-add',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

exports.addCar = async (req, res, next) => {
  let connection;
  try {
    let electric_car = false;
    let {
      generation_id,
      brand_id,
      model_id,
      engine,
      start_production,
      end_production,
      powertrain_architecture,
      new_powertrain_architecture,
      body_type,
      seat,
      door,
      fuel_consumption_urban,
      fuel_consumption_extraurban,
      fuel_consumption_combined,
      carbondioksida_emission,
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
      engine_system,
      coolant,
      length,
      width,
      height,
      wheelbase,
      front_track,
      rear_back_track,
      front_overhang,
      rear_overhang,
      minimum_turning_circle,
      kerb_weight,
      trunk_space_minimum,
      trunk_space_maximum,
      max_load,
      fuel_tank_capacity,
      permitted_trailer_load_with_brakes,
      permitted_trailer_load_without_brakes,
      permitted_towbardownload,
      drivetrain_architecture,
      drive_wheel,
      number_of_gears_and_type_of_gearbox,
      front_suspension,
      rear_suspension,
      front_brakes,
      rear_brakes,
      assisting_systems,
      tires_size,
      wheel_rims_size,
      battery_capacity,
      battery_technology,
      battery_location,
      all_electric_range,
      charging_ports,
      electric_motor_1_power,
      electric_motor_1_torque,
      electric_motor_1_location,
      electric_motor_1_type,
      electric_motor_2_power,
      electric_motor_2_torque,
      electric_motor_2_location,
      electric_motor_2_type,
      system_power,
      system_torque,
    } = req.body;

    if (new_powertrain_architecture) {
      powertrain_architecture = new_powertrain_architecture;
    }

    console.log('reqfiles', req.files);

    let hasAlert = false;

    if (!brand_id) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Brand is required',
      };
      hasAlert = true;
    } else if (!model_id) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Model is required',
      };
      hasAlert = true;
    } else if (!generation_id) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Generation is required',
      };
      hasAlert = true;
    } else if (!engine || engine === '') {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Engine is required',
      };
      hasAlert = true;
    } else if (!req.file || !req.files || req.files.length === 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Images is required',
      };
      hasAlert = true;
    }

    if (hasAlert) {
      return res.redirect('/admin/cars/add');
    }

    connection = await getConnection();
    await connection.beginTransaction();

    const generalInformation = [
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
      fuel_consumption_combined ?? '',
      carbondioksida_emission ?? '',
      fuel_type ?? '',
      acceleration_100kmh ?? '',
      acceleration_62mph ?? '',
      acceleration_60mph ?? '',
      maximum_speed ?? '',
      emission_standard ?? '',
      weight_to_power_ratio ?? '',
      weight_to_torque_ratio ?? '',
    ];

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
      engine_system ?? '',
      coolant ?? '',
    ];

    const dimensions = [
      length ?? '',
      width ?? '',
      height ?? '',
      wheelbase ?? '',
      front_track ?? '',
      rear_back_track ?? '',
      front_overhang ?? '',
      rear_overhang ?? '',
      minimum_turning_circle ?? '',
    ];

    const spaces = [
      kerb_weight ?? '',
      trunk_space_minimum ?? '',
      trunk_space_maximum ?? '',
      max_load ?? '',
      fuel_tank_capacity ?? '',
      permitted_trailer_load_with_brakes ?? '',
      permitted_trailer_load_without_brakes ?? '',
      permitted_towbardownload ?? '',
    ];

    const drivetrains = [
      drivetrain_architecture ?? '',
      drive_wheel ?? '',
      number_of_gears_and_type_of_gearbox ?? '',
      front_suspension ?? '',
      rear_suspension ?? '',
      front_brakes ?? '',
      rear_brakes ?? '',
      assisting_systems ?? '',
      tires_size ?? '',
      wheel_rims_size ?? '',
    ];

    if (battery_capacity) {
      electric_car = true;
    }

    let electrics;
    if (electric_car) {
      electrics = [
        battery_capacity ?? '',
        battery_technology ?? '',
        battery_location ?? '',
        all_electric_range ?? '',
        charging_ports ?? '',
        electric_motor_1_power ?? '',
        electric_motor_1_torque ?? '',
        electric_motor_1_location ?? '',
        electric_motor_1_type ?? '',
        electric_motor_2_power ?? '',
        electric_motor_2_torque ?? '',
        electric_motor_2_location ?? '',
        electric_motor_2_type ?? '',
        system_power ?? '',
        system_torque ?? '',
      ];
    }

    const gi = await DBquery(
      queryStore.specs.addGeneralInformation,
      generalInformation,
    );
    const ps = await DBquery(
      queryStore.specs.addPerformanceSpecs,
      performance_specs,
    );
    const es = await DBquery(queryStore.specs.addEngineSpecs, engine_specs);
    const d = await DBquery(queryStore.specs.addDimension, dimensions);
    const s = await DBquery(queryStore.specs.addSpace, spaces);
    const dbss = await DBquery(queryStore.specs.addDrivetrain, drivetrains);

    let el;
    if (electric_car) {
      el = await DBquery(queryStore.specs.addElectricSpec, electrics);
    }

    const insertCars = [
      generation_id,
      brand_id,
      model_id,
      gi.insertId,
      ps.insertId,
      es.insertId,
      d.insertId,
      s.insertId,
      dbss.insertId,
      el?.insertId ?? null,
    ];

    const carResult = await DBquery(
      'INSERT INTO cars(g_id, b_id, m_id, gi_id, ps_id, es_id, d_id, s_id, dbss_id, el_id) VALUES(?,?,?,?,?,?,?,?,?,?)',
      insertCars,
    );

    const carId = carResult.insertId;

    console.log('reqfiles', req.files);
    console.log('reqfile', req.file);

    if (req.files && req.files.length > 0) {
      const brand_name = await getBrandNameById(brand_id);
      const model_name = await getModelNameById(model_id);
      const generation_name = await getGenerationNameById(generation_id);

      let pathimage = `${brand_name}/${model_name}/${generation_name}/${
        generation_name + engine
      }`;
      pathimage = pathimage.toLowerCase().replace(/ /g, '-');

      const images = req.files.map((file) => [
        carId,
        `/assets/images/brands/${pathimage}/${file.filename}`,
      ]);

      await Promise.all(
        images.map(([carId, imagePath]) =>
          DBquery('INSERT INTO car_images(car_id, image_path) VALUES (?, ?)', [
            carId,
            imagePath,
          ]),
        ),
      );
    }

    await commitTransaction(connection);

    res.redirect('/admin/cars');
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    next(error);
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};

exports.getEditCar = async (req, res, next) => {
  try {
    const id = req.params.id;

    const carvalue = await DBquery('CALL get_spec(?)', [id]);

    const powertrain_architecture = await DBquery(`
      SELECT DISTINCT powertrain_architecture
      FROM general_information
      WHERE powertrain_architecture IS NOT NULL
        AND TRIM(powertrain_architecture) <> ''
    `);

    const car = carvalue[0][0];

    res.render('admin/car/edit', {
      data: {
        powertrain_architecture,
        car,
      },
      title: 'Car Update',
      currentPage: 'admin-car-edit',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCar = async (req, res, next) => {
  let connection;
  try {
    const car_id = req.params.id;
    let electric_car = false;
    let {
      generation_id,
      brand_id,
      model_id,
      engine,
      start_production,
      end_production,
      powertrain_architecture,
      new_powertrain_architecture,
      body_type,
      seat,
      door,
      fuel_consumption_urban,
      fuel_consumption_extraurban,
      fuel_consumption_combined,
      carbondioksida_emission,
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
      engine_system,
      coolant,
      length,
      width,
      height,
      wheelbase,
      front_track,
      rear_back_track,
      front_overhang,
      rear_overhang,
      minimum_turning_circle,
      kerb_weight,
      trunk_space_minimum,
      trunk_space_maximum,
      max_load,
      fuel_tank_capacity,
      permitted_trailer_load_with_brakes,
      permitted_trailer_load_without_brakes,
      permitted_towbardownload,
      drivetrain_architecture,
      drive_wheel,
      number_of_gears_and_type_of_gearbox,
      front_suspension,
      rear_suspension,
      front_brakes,
      rear_brakes,
      assisting_systems,
      tires_size,
      wheel_rims_size,
      battery_capacity,
      battery_technology,
      battery_location,
      all_electric_range,
      charging_ports,
      electric_motor_1_power,
      electric_motor_1_torque,
      electric_motor_1_location,
      electric_motor_1_type,
      electric_motor_2_power,
      electric_motor_2_torque,
      electric_motor_2_location,
      electric_motor_2_type,
      system_power,
      system_torque,
    } = req.body;

    if (new_powertrain_architecture) {
      powertrain_architecture = new_powertrain_architecture;
    }

    connection = await getConnection();
    await connection.beginTransaction();

    const recent = await DBquery(
      'SELECT b_id, m_id, g_id, gi_id, ps_id, es_id, d_id, s_id, dbss_id, el_id FROM cars WHERE id = ? LIMIT 1',
      [car_id],
    );

    if (brand_id || model_id || generation_id) {
      await DBquery(
        'UPDATE cars SET b_id = ?, m_id = ?, g_id = ? WHERE id = ?',
        [brand_id, model_id, generation_id, car_id],
      );
    }

    const generalInformation = [
      engine,
      start_production,
      end_production,
      powertrain_architecture,
      body_type,
      seat,
      door,
      recent[0].gi_id,
    ];

    const performance_specs = [
      fuel_consumption_urban ?? '',
      fuel_consumption_extraurban ?? '',
      fuel_consumption_combined ?? '',
      carbondioksida_emission ?? '',
      fuel_type ?? '',
      acceleration_100kmh ?? '',
      acceleration_62mph ?? '',
      acceleration_60mph ?? '',
      maximum_speed ?? '',
      emission_standard ?? '',
      weight_to_power_ratio ?? '',
      weight_to_torque_ratio ?? '',
      recent[0].ps_id,
    ];

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
      engine_system ?? '',
      coolant ?? '',
      recent[0].es_id,
    ];

    const dimensions = [
      length ?? '',
      width ?? '',
      height ?? '',
      wheelbase ?? '',
      front_track ?? '',
      rear_back_track ?? '',
      front_overhang ?? '',
      rear_overhang ?? '',
      minimum_turning_circle ?? '',
      recent[0].d_id,
    ];

    const spaces = [
      kerb_weight ?? '',
      trunk_space_minimum ?? '',
      trunk_space_maximum ?? '',
      max_load ?? '',
      fuel_tank_capacity ?? '',
      permitted_trailer_load_with_brakes ?? '',
      permitted_trailer_load_without_brakes ?? '',
      permitted_towbardownload ?? '',
      recent[0].s_id,
    ];

    const drivetrains = [
      drivetrain_architecture ?? '',
      drive_wheel ?? '',
      number_of_gears_and_type_of_gearbox ?? '',
      front_suspension ?? '',
      rear_suspension ?? '',
      front_brakes ?? '',
      rear_brakes ?? '',
      assisting_systems ?? '',
      tires_size ?? '',
      wheel_rims_size ?? '',
      recent[0].dbss_id,
    ];

    if (battery_capacity == '') {
      battery_capacity = undefined;
    }
    if (battery_capacity != undefined) {
      electric_car = true;
    }

    let electrics;
    if (electric_car) {
      electrics = [
        battery_capacity ?? '',
        battery_technology ?? '',
        battery_location ?? '',
        all_electric_range ?? '',
        charging_ports ?? '',
        electric_motor_1_power ?? '',
        electric_motor_1_torque ?? '',
        electric_motor_1_location ?? '',
        electric_motor_1_type ?? '',
        electric_motor_2_power ?? '',
        electric_motor_2_torque ?? '',
        electric_motor_2_location ?? '',
        electric_motor_2_type ?? '',
        system_power ?? '',
        system_torque ?? '',
      ];
    }

    await DBquery(
      queryStore.specs.updateGeneralInformation,
      generalInformation,
    );

    await DBquery(queryStore.specs.updatePerformanceSpec, performance_specs);

    await DBquery(queryStore.specs.updateEngineSpec, engine_specs);

    await DBquery(queryStore.specs.updateDimension, dimensions);

    await DBquery(queryStore.specs.updateSpaces, spaces);

    await DBquery(queryStore.specs.updateDrivetrain, drivetrains);

    if (electric_car) {
      if (recent[0].el_id == null) {
        const [el] = await DBquery(queryStore.specs.addElectricSpec, electrics);
        await DBquery('UPDATE cars SET el_id = ? WHERE id = ?', [
          el.insertId,
          car_id,
        ]);
      } else {
        await DBquery(queryStore.specs.updateElectric, [
          ...electrics,
          recent[0].el_id,
        ]);
      }
    }

    await commitTransaction(connection);

    req.session.alert = {
      type: 'alert-success',
      message: 'Success updated car',
    };
    res.redirect(`/admin/cars/update/${car_id}`);
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    console.log(error);
    next(error);
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};

exports.deleteCar = async (req, res, next) => {
  let connection;
  try {
    const car_id = req.params.id;

    connection = await getConnection();
    await connection.beginTransaction();

    let querystr = 'SELECT * FROM cars WHERE id = ? LIMIT 1';
    let queryvalue = [car_id];

    await DBquery(querystr, queryvalue).then(async (onres) => {
      if (onres[0].length == 0) {
        req.session.alert = {
          type: 'alert-danger',
          message: 'Cars not found',
        };
      }
      const car = onres[0];
      console.log(car);

      await DBquery(
        'DELETE FROM general_information WHERE id = ? AND EXISTS (SELECT 1 FROM general_information WHERE id = ?)',
        [car.gi_id, car.gi_id],
      );
      await DBquery(
        'DELETE FROM performance_specs WHERE id = ? AND EXISTS (SELECT 1 FROM performance_specs WHERE id = ?)',
        [car.ps_id, car.ps_id],
      );
      await DBquery(
        'DELETE FROM engine_specs WHERE id = ? AND EXISTS (SELECT 1 FROM engine_specs WHERE id = ?)',
        [car.es_id, car.es_id],
      );
      await DBquery(
        'DELETE FROM dimensions WHERE id = ? AND EXISTS (SELECT 1 FROM dimensions WHERE id = ?)',
        [car.d_id, car.d_id],
      );
      await DBquery(
        'DELETE FROM drivetrain_brakes_suspension_specs WHERE id = ? AND EXISTS (SELECT 1 FROM drivetrain_brakes_suspension_specs WHERE id = ?)',
        [car.dbss_id, car.dbss_id],
      );
      await DBquery(
        'DELETE FROM spaces WHERE id = ? AND EXISTS (SELECT 1 FROM spaces WHERE id = ?)',
        [car.s_id, car.s_id],
      );
      await DBquery(
        'DELETE FROM electric_specs WHERE id = ? AND EXISTS (SELECT 1 FROM electric_specs WHERE id = ?)',
        [car.el_id, car.el_id],
      );
      await DBquery(
        'DELETE FROM cars WHERE id = ? AND EXISTS (SELECT 1 FROM cars WHERE id = ?)',
        [car_id, car_id],
      );

      await commitTransaction(connection);

      return res.redirect(`/admin/cars?brand_id=${car.b_id}`);
    });
  } catch (error) {
    if (connection) {
      rollbackTransaction(connection);
      next(error);
    }
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};
