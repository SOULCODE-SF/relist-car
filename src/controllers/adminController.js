const db = require('../../db');
const query = require('../store/query');

exports.getUser = async (req, res) => {
  try {
    const [data] = await db.query('SELECT * FROM users');

    res.render('admin/user/index', {
      title: 'Manage User',
      currentPage: 'admin-user',
      layout: './admin/layouts/layout',
      data,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.addUser = async (req, res) => {
  try {
    const { username, email, password, name, role, location } = req.body;

    await db.query(
      'INSERT INTO users(username, email, password, name, role, location) VALUES (?,?,?,?,?,?)',
      [username, email, password, name, role, location]
    );

    res.status(201).json({
      message: 'sukses',
      data: req.body,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

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
