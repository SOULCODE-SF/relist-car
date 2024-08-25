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
const { formatFileName, moveFile, unlinkFile } = require('../../utils/helpers');

let querystr = '',
  queryvalue = [];

exports.getAllBanners = async (req, res, next) => {
  try {
    querystr = `select b.id, b.adsname, b.type, b.position, date_format(b.date_start, '%Y-%m-%d') as start_date, date_format(b.date_end, '%Y-%m-%d') as end_date, b.status, b.created_at, b.code, bi.image_path, bi.url from banners b left join banner_image bi on b.id = bi.banner_id`;

    const datas = await DBquery(querystr);

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
    res.render('admin/banner/add', {
      title: 'Add Banner',
      currentPage: 'admin-add-banner',
      layout: './admin/layouts/layout',
      data: {},
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

    const insertBannerDetails = async () => {
      querystr =
        'INSERT INTO banners (adsname, position, type, date_start, date_end, status, code) VALUES (?, ?, ?, ?, ?, ?, ?)';
      queryvalue = [
        ads_name,
        ads_position,
        ads_type,
        ads_start_date,
        ads_end_date,
        ads_status,
        ads_code ?? '-',
      ];

      await DBquery(querystr, queryvalue).then(async (onres) => {
        if (ads_type == 'image') {
          querystr =
            'INSERT INTO banner_image (image_path, url, banner_id) VALUES (?,?,?);';
          queryvalue = [ads_image, ads_url, onres.insertId];
        }
        await DBquery(querystr, queryvalue);

        return res.redirect('/admin/banner');
      });
    };

    let ads_image;
    if (ads_type === 'image') {
      const fileExtension = '.webp';
      const formattedFileName = formatFileName(ads_name, fileExtension);
      const oldPath = req.file.path;
      const newDir = path.join(
        __dirname,
        '../../../public/assets/images/banner',
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
  } catch (error) {
    next(error);
  }
};

exports.getBannerById = async (req, res, next) => {
  try {
    let banner_id = req.params.id;
    const data = await DBquery(
      `SELECT b.id, b.adsname, b.type, b.position, date_format(b.date_start, '%Y-%m-%d') as start_date, date_format(b.date_end, '%Y-%m-%d') as end_date, b.status, b.created_at, b.code, bi.image_path, bi.url from banners b left join banner_image bi on b.id = bi.banner_id WHERE b.id = ?`,
      [banner_id],
    );

    const positions = await DBquery('SELECT * FROM banner_positions');

    res.render('admin/banner/edit', {
      title: 'Edit Banner',
      currentPage: 'admin-banner-edit',
      layout: './admin/layouts/layout',
      data: data[0],
      positions,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const bannerId = req.params.id;

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

    let newFilePath;
    let ads_image;
    const fileExtension = '.webp';
    const formattedFileName = formatFileName(ads_name, fileExtension);

    if (ads_type === 'image' && req.file) {
      const oldPath = req.file.path;
      const newDir = path.join(
        __dirname,
        '../../../public/assets/images/banner',
      );
      newFilePath = path.join(newDir, formattedFileName);

      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }

      fs.renameSync(oldPath, newFilePath);
      ads_image = `/assets/images/banner/${formattedFileName}`;
    }

    const updateBannerDetails = async () => {
      try {
        if (ads_type === 'image') {
          const existingImage = await DBquery(
            'SELECT image_path FROM banner_image WHERE banner_id = ?',
            [bannerId],
          );

          if (existingImage.length > 0) {
            const oldImagePath = path.join(
              __dirname,
              '../../../public',
              existingImage[0].image_path,
            );

            const banner = await DBquery(
              'SELECT adsname FROM banners WHERE id = ?',
              [bannerId],
            );

            if (!req.file) {
              ads_image = existingImage[0].image_path;
            }

            if (banner.length > 0 && !req.file) {
              if (banner[0].adsname !== ads_name) {
                const newpath = path.join(
                  __dirname,
                  '../../../public',
                  `/assets/images/banner/${formattedFileName}`,
                );
                fs.renameSync(oldImagePath, newpath);
                ads_image = `/assets/images/banner/${formattedFileName}`;
              }
            }

            if (
              ads_image &&
              oldImagePath !==
                path.join(__dirname, '../../../public', ads_image)
            ) {
              unlinkFile(oldImagePath);
            }

            const updateImageQuery = `
              UPDATE banner_image 
              SET image_path = ?, url = ? 
              WHERE banner_id = ?
            `;
            const updateImageValues = [ads_image, ads_url, bannerId];
            await DBquery(updateImageQuery, updateImageValues);
          } else {
            const insertImageQuery = `
              INSERT INTO banner_image (image_path, url, banner_id) 
              VALUES (?, ?, ?)
            `;
            const insertImageValues = [ads_image, ads_url, bannerId];
            await DBquery(insertImageQuery, insertImageValues);
          }
        }

        const updateBannerQuery = `
          UPDATE banners 
          SET adsname = ?, position = ?, type = ?, date_start = ?, date_end = ?, status = ?, code = ?
          WHERE id = ?
        `;
        const updateBannerValues = [
          ads_name,
          ads_position,
          ads_type,
          ads_start_date,
          ads_end_date,
          ads_status,
          ads_code ?? '-',
          bannerId,
        ];

        await DBquery(updateBannerQuery, updateBannerValues);
        req.session.alert = {
          type: 'alert-success',
          message: 'Updated Banner Succesfully',
        };

        res.redirect(`/admin/banner/edit/${bannerId}`);
      } catch (updateError) {
        next(updateError);
      }
    };

    await updateBannerDetails();
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
        currentImagePath,
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
