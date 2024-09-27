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
const { handleImages } = require('../../../utils/helpers');

const cache = new nodecache();

exports.getCarsList = async (req, res, next) => {
  try {
    const brand_id = req.query.brand_id || '';

    const cars = await DBquery(queryStore.cars.getAllCars, [brand_id]);

    const datas = cars;

    res.render('admin/car/index', {
      datas,
      title: 'Cars List',
      currentPage: 'list-car-admin',
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
      [`%${brand_name}%`]
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
      [brand_id, `%${model_name}%`]
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

    const datas = await DBquery(
      'SELECT id, title as name FROM generations WHERE model_id = ?',
      [model_id]
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

    let querystr = `SELECT gi.engine as name FROM general_information gi `;
    if (search) {
      querystr += ` WHERE gi.engine LIKE ? `;
    }
    querystr += `GROUP BY gi.engine LIMIT 100`;

    const datas = await DBquery(querystr, [`%${search}%`]);

    datas.unshift({ name: 'None' });
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
      currentPage: 'add-car-admin',
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
    } else if (!req.files) {
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

    let engine_slug = engine.replace(/\./g, '-');
    engine_slug = engine_slug.replace(/ /g, '-');

    const generalInformation = [
      engine,
      start_production,
      end_production,
      powertrain_architecture,
      body_type,
      seat,
      door,
      engine_slug,
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
      generalInformation
    );
    const ps = await DBquery(
      queryStore.specs.addPerformanceSpecs,
      performance_specs
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
      insertCars
    );

    const carId = carResult.insertId;

    if (req.files) {
      console.log('car_id', carId);
      console.log('reqfiles', req.files);
      const brand_name = await getBrandNameById(brand_id);
      const model_name = await getModelNameById(model_id);
      const generation_name = await getGenerationNameById(generation_id);

      let pathimage = `images/brands/${brand_name}/${model_name}/${generation_name}/${
        generation_name + engine
      }`;
      pathimage = pathimage.toLowerCase().replace(/ /g, '-');

      let images_car = [req.files.car_images[0]];

      for (let i = 0; i < req.files.additional_car_images.length; i++) {
        images_car.push(req.files.additional_car_images[i]);
      }

      for (let i = 0; i < images_car.length; i++) {
        const props = {
          oldpath: null,
          fileName: i + 1,
          newDir: '/assets/' + pathimage,
          path: pathimage,
          uploadPath: images_car[i].path,
          ext: '.webp',
        };

        const image = await handleImages(props);
        if (image.success) {
          const querystr =
            'INSERT INTO car_images (image_path, car_id) VALUES (?,?)';
          const queryvalue = [image.path, carId];

          await DBquery(querystr, queryvalue);
        }
      }
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

    const carvalue = await DBquery('CALL get_spec_by_id(?)', [id]);

    const powertrain_architecture = await DBquery(`
      SELECT DISTINCT powertrain_architecture
      FROM general_information
      WHERE powertrain_architecture IS NOT NULL
        AND TRIM(powertrain_architecture) <> ''
    `);

    const car = carvalue[0][0];

    const getImages = await DBquery(
      'SELECT * FROM car_images WHERE car_id = ? ORDER BY id ASC',
      [car.car_id]
    );

    const main_image = getImages[0];
    const additional_images = getImages.slice(1);
    const images = {
      main_image,
      additional_images,
    };

    const data = {
      powertrain_architecture,
      car,
      images,
    };

    res.render('admin/car/edit', {
      data,
      title: 'Car Update',
      currentPage: 'edit-car-admin',
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

    console.log('req', req.files);
    console.log('erqbody', req.body);

    if (new_powertrain_architecture) {
      powertrain_architecture = new_powertrain_architecture;
    }

    connection = await getConnection();
    await connection.beginTransaction();

    const recent = await DBquery(
      'SELECT b_id, m_id, g_id, gi_id, ps_id, es_id, d_id, s_id, dbss_id, el_id FROM cars WHERE id = ? LIMIT 1',
      [car_id]
    );

    if (brand_id || model_id || generation_id) {
      await DBquery(
        'UPDATE cars SET b_id = ?, m_id = ?, g_id = ? WHERE id = ?',
        [brand_id, model_id, generation_id, car_id]
      );
    }

    if (!engine) {
      const getEngine = await DBquery(
        'SELECT engine FROM general_information WHERE id = ?',
        [recent[0].gi_id]
      );

      engine = getEngine[0].engine;
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

    console.log(generalInformation);

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
      generalInformation
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

    if (req.files) {
      let main_image = null;
      if (req.files.car_images) {
        main_image = req.files.car_images[0];
      }
      const additional_images = req.files.existing_additional_car_images;

      const query = `SELECT b.name AS brand_name, m.name AS model_name, g.title AS generation_name FROM cars c 
                      JOIN
                        brands b ON b.id = c.b_id
                      JOIN
                        models m ON m.id = c.m_id
                      JOIN
                        generations g ON g.id = c.g_id 
                      WHERE c.id = ?`;
      const getDetail = await DBquery(query, [car_id]);
      const detail = getDetail[0];
      let pathimage = `images/brands/${detail.brand_name}/${
        detail.model_name
      }/${detail.generation_name}/${detail.generation_name + engine}`;

      pathimage = pathimage.toLowerCase().replace(/ /g, '-');

      if (main_image) {
        const props = {
          oldpath: null,
          fileName: 1,
          newDir: '/assets/' + pathimage,
          path: pathimage,
          uploadPath: main_image.path,
          ext: '.webp',
        };

        const image = await handleImages(props);
        if (image.success) {
          const getSmallestIdQuery =
            'SELECT id FROM car_images WHERE car_id = ? ORDER BY id ASC LIMIT 1';
          const getId = await DBquery(getSmallestIdQuery, [car_id]);
          const querystr = 'UPDATE car_images SET image_path = ? WHERE id = ?';
          const queryvalue = [image.path, getId[0].id];

          await DBquery(querystr, queryvalue);
        }
      }

      const add_exist = req.body.existing_additional_images_ids;

      if (add_exist.length > 0 && additional_images.length > 0) {
        const sortedIds = add_exist.sort((a, b) => Number(a) - Number(b));
        const getImagesQuery =
          'SELECT * FROM car_images WHERE car_id = ? ORDER BY id ASC';
        const imagescar = await DBquery(getImagesQuery, [car_id]);

        const urutan_nomor = sortedIds
          .map((id) => {
            const imageIndex = imagescar.findIndex(
              (image) => image.id === Number(id)
            );
            return {
              id: Number(id),
              urutan: imageIndex !== -1 ? imageIndex + 1 : null,
            };
          })
          .filter((item) => item.urutan !== null);

        for (let i = 0; i < sortedIds.length; i++) {
          const idt = sortedIds[i];
          const urutanObj = urutan_nomor.find(
            (item) => item.id === Number(idt)
          );
          const props = {
            oldpath: null,
            fileName: urutanObj ? urutanObj.urutan : 'update',
            newDir: '/assets/' + pathimage,
            path: pathimage,
            uploadPath: additional_images[i].path,
            ext: '.webp',
          };

          const image = await handleImages(props);
          if (image.success) {
            const querystr =
              'UPDATE car_images SET image_path = ? WHERE id = ?';
            const queryvalue = [image.path, idt];

            await DBquery(querystr, queryvalue);
          }
        }
      }
    }

    await commitTransaction(connection);

    req.session.alert = {
      type: 'alert-success',
      message: 'Success updated car',
    };
    res.redirect(`/admin/cars-brands`);
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

      await DBquery(
        'DELETE FROM general_information WHERE id = ? AND EXISTS (SELECT 1 FROM general_information WHERE id = ?)',
        [car.gi_id, car.gi_id]
      );
      await DBquery(
        'DELETE FROM performance_specs WHERE id = ? AND EXISTS (SELECT 1 FROM performance_specs WHERE id = ?)',
        [car.ps_id, car.ps_id]
      );
      await DBquery(
        'DELETE FROM engine_specs WHERE id = ? AND EXISTS (SELECT 1 FROM engine_specs WHERE id = ?)',
        [car.es_id, car.es_id]
      );
      await DBquery(
        'DELETE FROM dimensions WHERE id = ? AND EXISTS (SELECT 1 FROM dimensions WHERE id = ?)',
        [car.d_id, car.d_id]
      );
      await DBquery(
        'DELETE FROM drivetrain_brakes_suspension_specs WHERE id = ? AND EXISTS (SELECT 1 FROM drivetrain_brakes_suspension_specs WHERE id = ?)',
        [car.dbss_id, car.dbss_id]
      );
      await DBquery(
        'DELETE FROM spaces WHERE id = ? AND EXISTS (SELECT 1 FROM spaces WHERE id = ?)',
        [car.s_id, car.s_id]
      );
      await DBquery(
        'DELETE FROM electric_specs WHERE id = ? AND EXISTS (SELECT 1 FROM electric_specs WHERE id = ?)',
        [car.el_id, car.el_id]
      );
      await DBquery(
        'DELETE FROM cars WHERE id = ? AND EXISTS (SELECT 1 FROM cars WHERE id = ?)',
        [car_id, car_id]
      );

      await DBquery('DELETE FROM car_images WHERE car_id = ?', [car_id]);

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
