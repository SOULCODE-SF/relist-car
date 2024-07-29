const db = require('../../../db');
const queryStore = require('../../store/query');
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

exports.getEngineName = async (req, res) => {
  try {
    const search = req.query.search;

    console.log(search);

    let querystr = `SELECT gi.engine as name FROM general_information gi `;
    if (search) {
      querystr += ` WHERE gi.engine LIKE ? `;
    }
    querystr += `GROUP BY gi.engine LIMIT 100`;

    const [datas] = await db.query(querystr, [`%${search}%`]);

    return res.json({
      datas,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getAddCar = async (req, res) => {
  try {
    const { error } = req.query;

    let iserror = false;

    if (error != undefined) {
      iserror = decodeURIComponent(error);
    }

    const [powertrain_architecture] = await db.query(`
      SELECT DISTINCT powertrain_architecture
      FROM general_information
      WHERE powertrain_architecture IS NOT NULL
        AND TRIM(powertrain_architecture) <> ''
    `);

    res.render('admin/car/add', {
      error: iserror,
      data: {
        powertrain_architecture,
      },
      title: 'Car Add',
      currentPage: 'admin-car-add',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    console.error(error);
    res.send('Internal Server Error');
  }
};
exports.addCar = async (req, res) => {
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

    connection = await db.getConnection();
    await connection.beginTransaction();

    if (new_powertrain_architecture) {
      powertrain_architecture = new_powertrain_architecture;
    }

    if (!brand_id) {
      return res.redirect(
        '/admin/cars/add?error=The%20car%20brand%20is%20required'
      );
    }

    if (!model_id) {
      return res.redirect(
        '/admin/cars/add?error=The%20car%20model%20is%20required'
      );
    }

    if (!generation_id) {
      return res.redirect(
        '/admin/cars/add?error=The%20car%20generation%20is%20required'
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

    if (battery_capacity == '') {
      battery_capacity = undefined;
    }
    if (battery_capacity != undefined) {
      electric_car = true;
    }
    console.log(battery_capacity);
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

    console.log(engine_specs);

    const gi = await connection.query(
      queryStore.specs.addGeneralInformation,
      generalInformation
    );

    const ps = await connection.query(
      queryStore.specs.addPerformanceSpecs,
      performance_specs
    );

    const es = await connection.query(
      queryStore.specs.addEngineSpecs,
      engine_specs
    );

    const d = await connection.query(queryStore.specs.addDimension, dimensions);

    const s = await connection.query(queryStore.specs.addSpace, spaces);

    const dbss = await connection.query(
      queryStore.specs.addDrivetrain,
      drivetrains
    );

    let el;
    if (electric_car) {
      el = await connection.query(queryStore.specs.addElectricSpec, electrics);
    }

    console.log('ELEC', electric_car);

    const insertCars = [
      generation_id,
      brand_id,
      model_id,
      gi[0].insertId,
      ps[0].insertId,
      es[0].insertId,
      d[0].insertId,
      s[0].insertId,
      dbss[0].insertId,
      el?.[0].insertId ?? null,
    ];

    await connection.query(
      'INSERT INTO cars(g_id, b_id, m_id, gi_id, ps_id, es_id, d_id, s_id, dbss_id, el_id) VALUES(?,?,?,?,?,?,?,?,?,?)',
      insertCars
    );

    console.log(req.body);

    await connection.commit();

    res.redirect('/admin/cars');
  } catch (error) {
    if (connection) {
      connection.rollback();
    }
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.getEditCar = async (req, res) => {
  try {
    const id = req.params.id;

    const { error } = req.query;

    let iserror = false;

    if (error != undefined) {
      iserror = decodeURIComponent(error);
    }

    const [carvalue] = await db.query('CALL get_spec(?)', [id]);

    const [powertrain_architecture] = await db.query(`
      SELECT DISTINCT powertrain_architecture
      FROM general_information
      WHERE powertrain_architecture IS NOT NULL
        AND TRIM(powertrain_architecture) <> ''
    `);

    const car = carvalue[0][0];

    res.render('admin/car/edit', {
      error: iserror,
      data: {
        powertrain_architecture,
        car,
      },
      title: 'Car Update',
      currentPage: 'admin-car-edit',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.updateCar = async (req, res) => {
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

    connection = await db.getConnection();
    await connection.beginTransaction();

    if (new_powertrain_architecture) {
      powertrain_architecture = new_powertrain_architecture;
    }

    const [recent] = await connection.query(
      'SELECT b_id, m_id, g_id, gi_id, ps_id, es_id, d_id, s_id, dbss_id, el_id  FROM cars WHERE id = ? LIMIT 1',
      [car_id]
    );

    console.log('gen', generation_id);
    console.log('genold', recent[0].g_id);

    if (brand_id || model_id || generation_id) {
      await connection.query(
        'UPDATE cars SET b_id = ?, m_id = ?, g_id = ? WHERE id = ?',
        [brand_id, model_id, generation_id, car_id]
      );
    }

    if (!brand_id) {
      brand_id = recent[0].b_id;
    }
    if (!model_id) {
      model_id = recent[0].m_id;
    }
    if (!generation_id) {
      generation_id = recent[0].g_id;
    }

    if (!brand_id) {
      return res.redirect(
        '/admin/cars/update?error=The%20car%20brand%20is%20required'
      );
    }

    if (!model_id) {
      return res.redirect(
        '/admin/cars/update?error=The%20car%20model%20is%20required'
      );
    }

    if (!generation_id) {
      return res.redirect(
        '/admin/cars/update?error=The%20car%20generation%20is%20required'
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

    const gi = await connection.query(
      queryStore.specs.updateGeneralInformation,
      generalInformation
    );

    const ps = await connection.query(
      queryStore.specs.updatePerformanceSpec,
      performance_specs
    );

    const es = await connection.query(
      queryStore.specs.updateEngineSpec,
      engine_specs
    );

    const d = await connection.query(
      queryStore.specs.updateDimension,
      dimensions
    );

    const s = await connection.query(queryStore.specs.updateSpaces, spaces);

    const dbss = await connection.query(
      queryStore.specs.updateDrivetrain,
      drivetrains
    );

    if (electric_car) {
      if (recent[0].el_id == null) {
        const el = await connection.query(
          queryStore.specs.addElectricSpec,
          electrics
        );
        await connection.query('UPDATE cars SET el_id = ? WHERE id = ?', [
          el[0].insertId,
          car_id,
        ]);
      } else {
        await connection.query(queryStore.specs.updateElectric, [
          ...electrics,
          recent[0].el_id,
        ]);
      }
    }

    await connection.commit();

    res.redirect(`/admin/cars/update/${car_id}`);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.deleteCar = async (req, res) => {
  let connection;
  try {
    const car_id = req.params.id;

    connection = await db.getConnection();
    await connection.beginTransaction();

    let querystr = 'SELECT * FROM cars WHERE id = ? LIMIT 1';
    let queryvalue = [car_id];

    await connection.query(querystr, queryvalue).then(async (onres) => {
      if (onres[0].length == 0) {
        res.status(404).send('Data Not Found!');
      }
      const car = onres[0][0];

      querystr = `
        DELETE FROM general_information WHERE id = ? AND EXISTS (SELECT 1 FROM general_information WHERE id = ?);
        DELETE FROM performance_specs WHERE id = ? AND EXISTS (SELECT 1 FROM performance_specs WHERE id = ?);
        DELETE FROM engine_specs WHERE id = ? AND EXISTS (SELECT 1 FROM engine_specs WHERE id = ?);
        DELETE FROM dimensions WHERE id = ? AND EXISTS (SELECT 1 FROM dimensions WHERE id = ?);
        DELETE FROM drivetrain_brakes_suspension_specs WHERE id = ? AND EXISTS (SELECT 1 FROM drivetrain_brakes_suspension_specs WHERE id = ?);
        DELETE FROM spaces WHERE id = ? AND EXISTS (SELECT 1 FROM spaces WHERE id = ?);
        DELETE FROM electric_specs WHERE id = ? AND EXISTS (SELECT 1 FROM electric_specs WHERE id = ?);
        DELETE FROM cars WHERE id = ? AND EXISTS (SELECT 1 FROM cars WHERE id = ?);`;
      queryvalue = [
        car.gi_id,
        car.gi_id,
        car.ps_id,
        car.ps_id,
        car.es_id,
        car.es_id,
        car.d_id,
        car.d_id,
        car.dbss_id,
        car.dbss_id,
        car.s_id,
        car.s_id,
        car_id,
        car_id,
      ];

      await connection.query(querystr, queryvalue).then((onres) => {
        return res.json('okeee');
      });
    });

    await connection.commit();
  } catch (error) {
    if (connection) {
      connection.rollback();
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
