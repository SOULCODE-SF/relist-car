const db = require('../../../db');
const query = require('../../store/query');

exports.getAllBanners = async (req, res) => {
  try {
    const [datas] = await db.query(query.getAllBannerQuery);

    res.render('admin/banner', {
      title: 'Manage Banner',
      currentPage: 'admin-banner',
      layout: './admin/layouts/layout',
      banners: datas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.addBanner = async (req, res) => {
  let connection;
  try {
    const {
      ads_name,
      ads_position,
      ads_type,
      ads_start_date,
      ads_end_date,
      ads_status,
      ads_code,
      ads_url,
    } = req.body;
    connection = await db.getConnection();
    await connection.beginTransaction();

    let ads_image;
    if (ads_type == 'image') {
      ads_image = req.file.path.replace(/\\/g, '/');
      const uploadsIndex = ads_image.indexOf('uploads');

      if (uploadsIndex !== -1) {
        let relativePath = ads_image.substring(uploadsIndex);
        relativePath = relativePath.replace(/\\/g, '/');
        ads_image = '/' + relativePath;
      }
    }

    const banner = await connection.query(query.addBannerQuery, [
      ads_name,
      ads_position,
      ads_type,
      ads_start_date,
      ads_end_date,
      ads_status,
    ]);

    if (ads_type == 'code') {
      await connection.query(query.addBannerCodeQuery, [
        ads_code,
        banner[0].insertId,
      ]);
    } else if (ads_type == 'image') {
      await connection.query(query.addBannerImageQuery, [
        ads_image,
        ads_url,
        banner[0].insertId,
      ]);
    }

    await connection.commit();

    res.redirect('/admin/banner');
  } catch (error) {
    await connection.rollback();
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.getBannerById = async (req, res) => {
  try {
    let banner_id = req.params.banner_id;
    const [data] = await db.query(`${query.getAllBannerQuery} WHERE b.id = ?`, [
      banner_id,
    ]);
    res.render('admin/banner/edit', {
      title: 'Edit Banner',
      currentPage: 'admin-banner-edit',
      layout: './admin/layouts/layout',
      banner: data[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};
exports.updateBanner = async (req, res) => {
  let connection;
  try {
    let banner_id = req.params.banner_id;
    const {
      ads_name,
      ads_position,
      ads_type,
      ads_start_date,
      ads_end_date,
      ads_status,
      ads_code,
      ads_url,
    } = req.body;

    console.log(req.body, banner_id);
    connection = await db.getConnection();
    await connection.beginTransaction();

    if (ads_type === 'code') {
      await connection.query(query.updateBannerCodeQuery, [
        ads_code,
        banner_id,
      ]);
    } else if (ads_type === 'image') {
      const image = await db.query(
        'SELET * FROM banner_image WHERE banner_id = ?',
        [banner_id]
      );

      let ads_image = req.file.path.replace(/\\/g, '/');
      const uploadsIndex = ads_image.indexOf('uploads');

      if (uploadsIndex !== -1) {
        let relativePath = ads_image.substring(uploadsIndex);
        relativePath = relativePath.replace(/\\/g, '/');
        ads_image = '/' + relativePath;
      }

      const currentBanner = await connection.query(query.getBannerByIdQuery, [
        banner_id,
      ]);
      const currentImagePath = currentBanner[0].image_path;

      await connection.query(query.updateBannerImageQuery, [
        ads_image,
        ads_url,
        banner_id,
      ]);

      if (currentImagePath) {
        const filePath = path.join(__dirname, '..', currentImagePath);
        await fs.unlink(filePath);
      }
    }

    // Update banners table with common fields
    await connection.query(query.updateBannerQuery, [
      ads_name,
      ads_position,
      ads_type,
      ads_start_date,
      ads_end_date,
      ads_status,
      banner_id,
    ]);

    await connection.commit();

    res.redirect('/admin/banner');
  } catch (error) {
    await connection.rollback();
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
