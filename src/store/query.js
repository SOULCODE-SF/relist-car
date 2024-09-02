let queryStore = {
  home: {
    recentCars: `select c.id, concat(g.title , ' ', gi.engine) as name, b.name as brand_name, m.name as model_name, g.title as generation_name, g.image_path, gi.*, ps.fuel_consumption_combined , dbss.drive_wheel from cars c join brands b on b.id = c.b_id join models m on m.id = c.m_id join generations g on g.id = c.g_id left join general_information gi on gi.id = c.gi_id left join performance_specs ps on ps.id = c.ps_id left join drivetrain_brakes_suspension_specs dbss on dbss.id = c.dbss_id order by rand() limit ?;`,
  },
  brands: {
    getAllBrands:
      'SELECT b.id, b.name,  LOWER(b.name) AS param,b.image_path  FROM brands b WHERE b.name LIKE ?',
  },
  models: {
    getModelByBrand: `SELECT m.id, m.name , m.image_path, b.name as brand_name, LOWER(REPLACE(TRIM(m.name), ' ', '-')) AS param, LOWER(REPLACE(TRIM(b.name), ' ', '-')) AS brand_param FROM models m JOIN brands b on b.id = m.brand_id WHERE b.name = ?;`,
  },
  generations: {
    getGenerationByModelQuery: `SELECT g.id, g.title, g.image_path, SUBSTRING(MAX(gi.start_production), LOCATE(',', MAX(gi.start_production)) + 1, 5) as start_production, SUBSTRING(MAX(gi.end_production), LOCATE(',', MAX(gi.end_production)) + 1, 5) as end_production, MAX(gi.body_type) as body_type , MAX(gi.engine) as engine, MAX(CONCAT_WS(' x ', d.length, d.width, d.height)) AS dimension, MAX(es.power) as power, b.name as brand_name, m.name as model_name, b.id as brand_id, LOWER(REPLACE(TRIM(g.title), ' ', '-')) AS gen_param, LOWER(REPLACE(TRIM(b.name), ' ', '-')) AS brand_param, LOWER(REPLACE(TRIM(m.name), ' ', '-')) AS model_param FROM generations g LEFT JOIN generation_links_2 gl on g.id = gl.generation_id LEFT JOIN general_information gi on gl.id = gi.generation_link_id LEFT JOIN dimensions d on d.generation_link_id = gl.id LEFT JOIN engine_specs es on es.generation_link_id = gl.id JOIN models m on g.model_id = m.id JOIN brands b on b.id = m.brand_id WHERE m.name = ? GROUP BY g.id;`,
    list: `SELECT c.id, gi.engine, c.b_id, c.m_id, c.g_id, b.name as brand_name, m.name as model_name, LOWER(REPLACE(TRIM(g.title), ' ', '-')) AS gen_param, LOWER(REPLACE(TRIM(b.name), ' ', '-')) AS brand_param, LOWER(REPLACE(TRIM(m.name), ' ', '-')) AS model_param, g.title as generation_name, SUBSTRING(gi.start_production, LOCATE(',', gi.start_production) + 1, 5) as start_production, SUBSTRING(gi.end_production, LOCATE(',', gi.end_production) + 1, 5) as end_production, ps.acceleration_100kmh, ps.acceleration_62mph , ps.acceleration_60mph, g.flag FROM cars c JOIN brands b on c.b_id = b.id JOIN models m on c.m_id = m.id JOIN generations g on c.g_id = g.id LEFT JOIN general_information gi on c.gi_id = gi.id LEFT JOIN performance_specs ps on c.ps_id = ps.id WHERE g.title = ?`,
  },

  banners: {
    getAllBannerQuery: `select b.id, b.adsname, b.type, b.position, date_format(b.date_start, '%Y-%m-%d') as start_date, date_format(b.date_end, '%Y-%m-%d') as end_date, b.status, b.created_at, bc.code, bi.image, bi.url from banners b left join banner_code bc on b.id = bc.banner_id left join banner_image bi on b.id = bi.banner_id`,
    addBannerQuery: `INSERT INTO banners(adsname, position, type, date_start, date_end, status) VALUES(?,?,?,?,?,?)`,
    addBannerCodeQuery: 'INSERT INTO banner_code(code, banner_id) VALUES (?,?)',
    addBannerImageQuery:
      'INSERT INTO banner_image(image, url, banner_id) VALUES (?,?,?)',
    updateBannerQuery: `UPDATE banners SET adsname = ?, position = ?, type = ?, date_start = ?, date_end = ?, status = ? WHERE id = ?`,
    updateBannerCodeQuery:
      'UPDATE banner_code SET code = ? WHERE banner_id = ?',
    updateBannerImageQuery:
      'UPDATE banner_image SET image = ?, url = ? WHERE banner_id = ?',
    getBannerByIdQuery: 'select * from banner_image where banner_id  = ?',
    deleteBannerQuery:
      'delete from banners where id = ? ; delete from banner_image where banner_id = ? ; delete from banner_code where banner_id = ? ;',
  },
  dashboard: {
    cars: 'SELECT (SELECT COUNT(*) FROM cars) AS count_cars, (SELECT COUNT(DISTINCT b_id) FROM cars) AS count_brands, (select COUNT(distinct m_id) from cars) as count_models, (select count(distinct g_id) from cars) as count_generations',
  },
  cars: {
    getAllCars: `select c.*, concat(g.title, ' ', gi.engine) as car_title, b.name as brand_name, m.name as model_name from cars c join brands b on c.b_id = b.id join models m on c.m_id = m.id join generations g on c.g_id = g.id left join general_information gi on c.gi_id = gi.id WHERE c.b_id = ?`,
    getEngine: `SELECT gi.engine FROM general_information gi GROUP BY gi.engine`,
    getAllBrands: 'SELECT * FROM brands',
  },
  specs: {
    addGeneralInformation:
      'insert into general_information( generation_link_id, engine, start_production, end_production, powertrain_architecture, body_type, seat, door ) values (0, ?, ?, ?, ?, ?, ?, ?);',
    addPerformanceSpecs:
      'INSERT INTO performance_specs ( generation_link_id, fuel_consumption_urban, fuel_consumption_extra_urban, fuel_consumption_combined, co2_emission, fuel_type, acceleration_100kmh, acceleration_62mph, acceleration_60mph, maximum_speed, emission_standard, weight_power_ratio, weight_power_torque ) VALUES (10000, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    addEngineSpecs:
      'INSERT INTO engine_specs ( generation_link_id, power, power_per_litre, torque, engine_layout, engine_model, engine_displacement, number_cylinders, engine_configuration, cylinder_bore, piston_stroke, compression_ratio, number_valves_per_cylinder, fuel_injection_system, engine_aspiration, engine_oil_capacity, engine_oil_specification, engine_system, coolant ) VALUES (0,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    addDimension: `insert into dimensions ( generation_link_id, length, width, height, wheelbase, front_track, rear_back_track, front_overhang, rear_overhang, minimum_turning_circle ) values (0,?,?,?,?,?,?,?,?,?);`,
    addSpace: `insert into spaces ( generation_link_id, kerb_weight, trunk_space_minimum , trunk_space_maximum , max_load , fuel_tank_capacity , permitted_trailer_load_with_brakes , permitted_trailer_load_without_brakes , permitted_towbardownload ) VALUES (0,?,?,?,?,?,?,?,?)`,
    addElectricSpec: `INSERT INTO electric_specs ( generation_link_id, battery_capacity, battery_technology, battery_location, all_electric_range, charging_ports, electric_motor_1_power, electric_motor_1_torque, electric_motor_1_location, electric_motor_1_type, electric_motor_2_power, electric_motor_2_torque, electric_motor_2_location, electric_motor_2_type, system_power, system_torque ) VALUES(0, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    addDrivetrain: `INSERT INTO drivetrain_brakes_suspension_specs ( generation_link_id, drivetrain_architecture, drive_wheel, number_of_gears_and_type_of_gearbox, front_suspension, rear_suspension, front_brakes, rear_brakes, assisting_systems, tires_size, wheel_rims_size ) VALUES (0, ?,?,?,?,?,?,?,?,?,?);`,
    updateGeneralInformation: `UPDATE general_information SET engine = ?, start_production = ?, end_production = ?, powertrain_architecture = ?, body_type = ?, seat = ?, door = ? WHERE id = ?;`,
    updatePerformanceSpec: `UPDATE performance_specs SET fuel_consumption_urban = ?, fuel_consumption_extra_urban = ?, fuel_consumption_combined = ?, co2_emission = ?, fuel_type = ?, acceleration_100kmh = ?, acceleration_62mph = ?, acceleration_60mph = ?, maximum_speed = ?, emission_standard = ?, weight_power_ratio = ?, weight_power_torque = ? WHERE id = ?;`,
    updateEngineSpec: `UPDATE engine_specs SET power = ?, power_per_litre = ?, torque = ?, engine_layout = ?, engine_model = ?, engine_displacement = ?, number_cylinders = ?, engine_configuration = ?, cylinder_bore = ?, piston_stroke = ?, compression_ratio = ?, number_valves_per_cylinder = ?, fuel_injection_system = ?, engine_aspiration = ?, engine_oil_capacity = ?, engine_oil_specification = ?, engine_system = ?, coolant = ? WHERE id = ?;`,
    updateDimension: `UPDATE dimensions SET length = ?, width = ?, height = ?, wheelbase = ?, front_track = ?, rear_back_track = ?, front_overhang = ?, rear_overhang = ?, minimum_turning_circle = ? WHERE id = ?;`,
    updateDrivetrain: `UPDATE drivetrain_brakes_suspension_specs SET drivetrain_architecture = ?, drive_wheel = ?, number_of_gears_and_type_of_gearbox = ?, front_suspension = ?, rear_suspension = ?, front_brakes = ?, rear_brakes = ?, assisting_systems = ?, tires_size = ?, wheel_rims_size = ? WHERE id = ?;`,
    updateSpaces: `UPDATE spaces SET kerb_weight = ?, trunk_space_minimum = ?, trunk_space_maximum = ?, max_load = ?, fuel_tank_capacity = ?, permitted_trailer_load_with_brakes = ?, permitted_trailer_load_without_brakes = ?, permitted_towbardownload = ? WHERE id = ?;`,
    updateElectric: `UPDATE electric_specs SET battery_capacity = ?, battery_technology = ?, battery_location = ?, all_electric_range = ?, charging_ports = ?, electric_motor_1_power = ?, electric_motor_1_torque = ?, electric_motor_1_location = ?, electric_motor_1_type = ?, electric_motor_2_power = ?, electric_motor_2_torque = ?, electric_motor_2_location = ?, electric_motor_2_type = ?, system_power = ?, system_torque = ? WHERE id = ?;`,
  },
  users: {
    addUser: `INSERT INTO users (username, email, password, role, name, location) VALUES (?,?,?,?,?,?);`,
    getLoginData: `SELECT * FROM users WHERE (username = ? OR email = ?);`,
    cekUsername: `SELECT username FROM users WHERE username = ?;`,
    cekEmail: `SELECT email FROM users WHERE email = ?;`,
  },
};

module.exports = queryStore;
