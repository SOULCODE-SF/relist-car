let query = {
  home: {
    recentCars:
      'SELECT gl.id as gl_id, g.id, g.title as name, g.image_path, gl.title as engine, gi.body_type, dbss.drive_wheel, ps.fuel_consumption_combined FROM generation_links_2 gl JOIN generations g ON g.id = gl.generation_id LEFT JOIN general_information gi ON gl.id = gi.generation_link_id LEFT JOIN dimensions d ON gl.id = d.generation_link_id LEFT JOIN drivetrain_brakes_suspension_specs dbss on gl.id = dbss.generation_link_id LEFT JOIN performance_specs ps ON gl.id = ps.generation_link_id ORDER BY RAND() LIMIT ?;',
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
};
module.exports = query;
