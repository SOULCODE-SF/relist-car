let query = {
  getAllBannerQuery: `select b.id, b.adsname, b.type, b.position, date_format(b.date_start, '%Y-%m-%d') as start_date, date_format(b.date_end, '%Y-%m-%d') as end_date, b.status, b.created_at, bc.code, bi.image, bi.url from banners b left join banner_code bc on b.id = bc.banner_id left join banner_image bi on b.id = bi.banner_id`,
  addBannerQuery: `INSERT INTO banners(adsname, position, type, date_start, date_end, status) VALUES(?,?,?,?,?,?)`,
  addBannerCodeQuery: 'INSERT INTO banner_code(code, banner_id) VALUES (?,?)',
  addBannerImageQuery:
    'INSERT INTO banner_image(image, url, banner_id) VALUES (?,?,?)',
};
module.exports = query;
