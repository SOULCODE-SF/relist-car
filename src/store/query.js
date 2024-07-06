let query = {
  brands: {
    getAllBrands:
      'SELECT b.id, b.name, b.image_path  FROM brands b WHERE b.name LIKE ?',
  },
  models: {
    getModelByBrand: `SELECT m.id, m.name , m.image_path, b.name as brand_name  FROM models m JOIN brands b on b.id = m.brand_id WHERE brand_id = ?`,
  },
  generations: {
    getGenerationByModelQuery: `SELECT g.id, g.title, g.image_path, MAX(gi.start_production) as start_production, MAX(gi.end_production) as end_production, MAX(gi.body_type) as body_type , b.name as brand_name, m.name as model_name, b.id as brand_id FROM generations g JOIN generation_links_2 gl on g.id = gl.generation_id JOIN general_information gi on gl.id = gi.generation_link_id JOIN models m on g.model_id = m.id JOIN brands b on b.id = m.brand_id WHERE g.model_id = ? GROUP BY g.id;`,
  },
  getAllBannerQuery: `select b.id, b.adsname, b.type, b.position, date_format(b.date_start, '%Y-%m-%d') as start_date, date_format(b.date_end, '%Y-%m-%d') as end_date, b.status, b.created_at, bc.code, bi.image, bi.url from banners b left join banner_code bc on b.id = bc.banner_id left join banner_image bi on b.id = bi.banner_id`,
  addBannerQuery: `INSERT INTO banners(adsname, position, type, date_start, date_end, status) VALUES(?,?,?,?,?,?)`,
  addBannerCodeQuery: 'INSERT INTO banner_code(code, banner_id) VALUES (?,?)',
  addBannerImageQuery:
    'INSERT INTO banner_image(image, url, banner_id) VALUES (?,?,?)',
  updateBannerQuery: `UPDATE banners SET adsname = ?, position = ?, type = ?, date_start = ?, date_end = ?, status = ? WHERE id = ?`,
  updateBannerCodeQuery: 'UPDATE banner_code SET code = ? WHERE banner_id = ?',
  updateBannerImageQuery:
    'UPDATE banner_image SET image = ?, url = ? WHERE banner_id = ?',
  getBannerByIdQuery: 'select * from banner_image where banner_id  = ?',
};
module.exports = query;
