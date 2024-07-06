const db = require('../../../db');
const query = require('../../store/query');
const path = require('path');
const fs = require('fs');
exports.getAllBanners = async (req, res) => {
  try {
    const [datas] = await db.query(query.banners.getAllBannerQuery);

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

exports.getAddBanner = async (req, res) => {
  try {
    const [positions] = await db.query('SELECT * FROM banner_positions');

    res.render('admin/banner/add', {
      title: 'Add Banner',
      currentPage: 'admin-add-banner',
      layout: './admin/layouts/layout',
      positions,
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

    const banner = await connection.query(query.banners.addBannerQuery, [
      ads_name,
      ads_position,
      ads_type,
      ads_start_date,
      ads_end_date,
      ads_status,
    ]);

    if (ads_type == 'code') {
      await connection.query(query.banners.addBannerCodeQuery, [
        ads_code,
        banner[0].insertId,
      ]);
    } else if (ads_type == 'image') {
      await connection.query(query.banners.addBannerImageQuery, [
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
    const [data] = await db.query(
      `${query.banners.getAllBannerQuery} WHERE b.id = ?`,
      [banner_id]
    );
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

    connection = await db.getConnection();
    await connection.beginTransaction();

    if (ads_type === 'code') {
      await connection.query(query.banners.updateBannerCodeQuery, [
        ads_code,
        banner_id,
      ]);
    } else if (ads_type === 'image') {
      if (!req.file) {
        const [imageData] = await connection.query(
          'SELECT * FROM banner_image WHERE banner_id = ?',
          [banner_id]
        );

        if (imageData.length > 0) {
          const ads_image = imageData[0].image; // Periksa apakah ada data di sini

          await connection.query(query.banners.updateBannerImageQuery, [
            ads_image,
            ads_url,
            banner_id,
          ]);
        } else {
          console.error(`No image found for banner_id ${banner_id}`);
          throw new Error('error');
        }
      } else {
        // Jika ada file yang diunggah, proses seperti biasa
        let ads_image = req.file.path.replace(/\\/g, '/');
        const uploadsIndex = ads_image.indexOf('uploads');
        if (uploadsIndex !== -1) {
          let relativePath = ads_image.substring(uploadsIndex);
          relativePath = relativePath.replace(/\\/g, '/');
          ads_image = '/' + relativePath;
        }

        // Ambil path gambar saat ini untuk penghapusan nanti
        const [currentBanner] = await connection.query(
          query.banners.getBannerByIdQuery,
          [banner_id]
        );
        const currentImagePath = currentBanner[0]?.image;

        if (currentImagePath) {
          const filePath = path.join(
            __dirname,
            '../../../public',
            currentImagePath
          );

          fs.unlink(filePath, (err) => {
            if (err) {
              console.log('failed to delete local image:' + err);
            } else {
              console.log('successfully deleted local image');
            }
          });

          await connection.query(query.banners.updateBannerImageQuery, [
            ads_image,
            ads_url,
            banner_id,
          ]);
        } else {
          await connection.query(query.banners.addBannerImageQuery, [
            ads_image,
            ads_url,
            banner_id,
          ]);
        }
      }
    }

    await connection.query(query.banners.updateBannerQuery, [
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

exports.deleteBanner = async (req, res) => {
  let connection;
  try {
    const banner_id = parseInt(req.params.banner_id);

    connection = await db.getConnection();
    await connection.beginTransaction();

    await connection.query('DELETE FROM banner_code WHERE banner_id = ?', [
      banner_id,
    ]);

    await connection.query('DELETE FROM banner_image WHERE banner_id = ?', [
      banner_id,
    ]);

    await connection.query('DELETE FROM banners WHERE id = ?', [banner_id]);

    await connection.commit();

    res.redirect('/admin/banner');
  } catch (error) {
    await connection.rollback();
    console.error(error.message);
    res.status(500).json(error.message);
  } finally {
    const [currentBanner] = await connection.query(
      query.banners.getBannerByIdQuery,
      [banner_id]
    );
    const currentImagePath = currentBanner[0]?.image;

    if (currentImagePath) {
      const filePath = path.join(
        __dirname,
        '../../../public',
        currentImagePath
      );

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log('Failed to delete local image:', err);
        } else {
          console.log('Successfully deleted local image');
        }
      });
    }
    if (connection) {
      connection.release();
    }
  }
};
