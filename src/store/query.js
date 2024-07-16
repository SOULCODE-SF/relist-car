let queryStore = {
  home: {
    recentCars:
      'select c.id, b.name as brand_name, m.name as model_name, g.title as generation_name, g.image_path, gi.*, ps.fuel_consumption_combined , dbss.drive_wheel from cars c join brands b on b.id = c.b_id join models m on m.id = c.m_id join generations g on g.id = c.g_id left join general_information gi on gi.id = c.gi_id left join performance_specs ps on ps.id = c.ps_id left join drivetrain_brakes_suspension_specs dbss on dbss.id = c.dbss_id order by rand() limit ?;',
  },
  brands: {
    getAllBrands:
      'SELECT b.id, b.name, b.image_path  FROM brands b WHERE b.name LIKE ?',
  },
  models: {
    getModelByBrand: `SELECT m.id, m.name , m.image_path, b.name as brand_name  FROM models m JOIN brands b on b.id = m.brand_id WHERE brand_id = ?`,
  },
  generations: {
    getGenerationByModelQuery: `SELECT g.id, g.title, g.image_path, SUBSTRING(MAX(gi.start_production), LOCATE(',', MAX(gi.start_production)) + 1, 5) as start_production, SUBSTRING(MAX(gi.end_production), LOCATE(',', MAX(gi.end_production)) + 1, 5) as end_production, MAX(gi.body_type) as body_type , MAX(gi.engine) as engine, MAX(CONCAT_WS(' x ', d.length, d.width, d.height)) AS dimension, MAX(es.power) as power, b.name as brand_name, m.name as model_name, b.id as brand_id FROM generations g LEFT JOIN generation_links_2 gl on g.id = gl.generation_id LEFT JOIN general_information gi on gl.id = gi.generation_link_id LEFT JOIN dimensions d on d.generation_link_id = gl.id LEFT JOIN engine_specs es on es.generation_link_id = gl.id JOIN models m on g.model_id = m.id JOIN brands b on b.id = m.brand_id WHERE m.id = ? GROUP BY g.id;`,
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
  },
  specs: {
    addGeneralInformation:
      'insert into general_information( generation_link_id, engine, start_production, end_production, powertrain_architecture, body_type, seat, door ) values (?, ?, ?, ?, ?, ?, ?, ?);',
    addPerformanceSpecs:
      'insert into performance_specs (generation_link_id, fuel_consumption_urban, fuel_consumption_extra_urban, fuel_type, acceleration_100kmh, acceleration_62mph, acceleration_60mph, maximum_speed, emission_standard, weight_power_ratio, weight_power_torque) values (100000,?,?,?,?,?,?,?,?,?,?)',
    addEngineSpecs:
      'insert into engine_specs ( generation_link_id, power, power_per_litre, torque, engine_layout, engine_model, engine_displacement, number_cylinders, engine_configuration, cylinder_bore, piston_stroke, compression_ratio, number_valves_per_cylinder, fuel_injection_system, engine_aspiration, engine_oil_capacity, engine_oil_specification, coolant ) values (10000,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  },
  users: {
    addUser: `INSERT INTO users (username, email, password, role, name, location) VALUES (?,?,?,?,?,?);`,
    getLoginData: `SELECT * FROM users WHERE (username = ? OR email = ?);`,
    cekUsername: `SELECT username FROM users WHERE username = ?;`,
    cekEmail: `SELECT email FROM users WHERE email = ?;`,
  },
};
module.exports = queryStore;
