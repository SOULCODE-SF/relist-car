const path = require('path');
const fs = require('fs');
const queryStore = require('../../store/query');
const {
  DBquery,
  getConnection,
  commitTransaction,
  rollbackTransaction,
  releaseConnection,
} = require('../../utils/database');
const { formatFileName, moveFile } = require('../../utils/helpers');

exports.getAllBanners = async (req, res, next) => {
  try {
    const datas = await DBquery(queryStore.banners.getAllBannerQuery);

    res.render('admin/banner', {
      title: 'Manage Banner',
      currentPage: 'admin-banner',
      layout: './admin/layouts/layout',
      banners: datas,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddBanner = async (req, res, next) => {
  try {
    const positions = await DBquery('SELECT * FROM banner_positions');

    res.render('admin/banner/add', {
      title: 'Add Banner',
      currentPage: 'admin-add-banner',
      layout: './admin/layouts/layout',
      positions,
    });
  } catch (error) {
    next(error);
  }
};

exports.addBanner = async (req, res, next) => {
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

    let ads_image;
    if (ads_type === 'image') {
      const fileExtension = '.webp';
      const formattedFileName = formatFileName(ads_name, fileExtension);
      const oldPath = req.file.path;
      const newDir = path.join(
        __dirname,
        '../../../public/assets/images/banner'
      );
      const newFilePath = path.join(newDir, formattedFileName);

      fs.mkdir(newDir, { recursive: true }, (err) => {
        if (err) throw new Error('Error creating directory');

        moveFile(oldPath, newFilePath, (err) => {
          if (err) throw new Error('Error moving file');

          ads_image = `/assets/images/banner/${formattedFileName}`;

          insertBannerDetails();
        });
      });
    } else {
      insertBannerDetails();
    }

    function insertBannerDetails() {
      const querystr =
        'INSERT INTO banners (adsname, position, type, date_start, date_end, status) VALUES (?, ?, ?, ?, ?, ?)';
      const queryvalue = [
        ads_name,
        ads_position,
        ads_type,
        ads_start_date,
        ads_end_date,
        ads_status,
      ];

      DBquery(querystr, queryvalue)
        .then((result) => {
          const bannerId = result.insertId;
          if (ads_type === 'code') {
            return DBquery(
              'INSERT INTO banner_code (code, banner_id) VALUES (?, ?)',
              [ads_code, bannerId]
            );
          } else if (ads_type === 'image') {
            return DBquery(
              'INSERT INTO banner_image (image, url, banner_id) VALUES (?, ?, ?)',
              [ads_image, ads_url, bannerId]
            );
          }
        })
        .then(() => {
          res.redirect('/admin/banner');
        })
        .catch(next);
    }
  } catch (error) {
    next(error);
  }
};

exports.getBannerById = async (req, res, next) => {
  try {
    let banner_id = req.params.banner_id;
    const data = await DBquery(
      `${queryStore.banners.getAllBannerQuery} WHERE b.id = ?`,
      [banner_id]
    );

    res.render('admin/banner/edit', {
      title: 'Edit Banner',
      currentPage: 'admin-banner-edit',
      layout: './admin/layouts/layout',
      banner: data[0],
    });
  } catch (error) {
    next(error);
  }
};
exports.updateBanner = async (req, res, next) => {
  try {
    const bannerId = req.params.id; // Mendapatkan ID banner dari parameter URL
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

    let ads_image;
    if (ads_type === 'image' && req.file) {
      const fileExtension = '.webp';
      const formattedFileName = formatFileName(ads_name, fileExtension);
      const oldPath = req.file.path;
      const newDir = path.join(
        __dirname,
        '../../../public/assets/images/banner'
      );
      const newFilePath = path.join(newDir, formattedFileName);

      // Buat direktori jika tidak ada
      fs.mkdir(newDir, { recursive: true }, (err) => {
        if (err) return next(new Error('Error creating directory'));

        // Pindahkan file ke direktori baru
        moveFile(oldPath, newFilePath, async (err) => {
          if (err) return next(new Error('Error moving file'));

          ads_image = `/assets/images/banner/${formattedFileName}`;

          await updateBannerDetails();
        });
      });
    } else {
      await updateBannerDetails();
    }

    async function updateBannerDetails() {
      const querystr = `
        UPDATE banners 
        SET adsname = ?, position = ?, type = ?, date_start = ?, date_end = ?, status = ?
        WHERE id = ?
      `;
      const queryvalue = [
        ads_name,
        ads_position,
        ads_type,
        ads_start_date,
        ads_end_date,
        ads_status,
        bannerId,
      ];

      try {
        await DBquery(querystr, queryvalue);

        if (ads_type === 'code') {
          await DBquery('UPDATE banner_code SET code = ? WHERE banner_id = ?', [
            ads_code,
            bannerId,
          ]);
        } else if (ads_type === 'image') {
          const oldImage = await DBquery(
            'SELECT image FROM banner_image WHERE banner_id = ?',
            [bannerId]
          );

          if (oldImage && oldImage.image_path) {
            const oldImagePath = path.join(
              __dirname,
              '../../../public',
              oldImage.image_path
            );
            await unlinkFile(oldImagePath);
          }

          await DBquery(
            'UPDATE banner_image SET image = ?, url = ? WHERE banner_id = ?',
            [ads_image, ads_url, bannerId]
          );
        }

        res.redirect('/admin/banner');
      } catch (updateError) {
        next(updateError);
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteBanner = async (req, res) => {
  let connection;
  const banner_id = parseInt(req.params.banner_id);
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    await DBquery('DELETE FROM banner_code WHERE banner_id = ?', [banner_id]);

    await DBquery('DELETE FROM banner_image WHERE banner_id = ?', [banner_id]);

    await DBquery('DELETE FROM banners WHERE id = ?', [banner_id]);

    await commitTransaction(connection);

    res.redirect('/admin/banner');
  } catch (error) {
    await rollbackTransaction(connection);
    next(error);
  } finally {
    const currentBanner = await DBquery(queryStore.banners.getBannerByIdQuery, [
      banner_id,
    ]);
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
      releaseConnection(connection);
    }
  }
};
