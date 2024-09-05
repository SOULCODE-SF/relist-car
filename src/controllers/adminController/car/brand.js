const path = require('path');
const fs = require('fs');
const { DBquery } = require('../../../utils/database');
const {
  formatFileName,
  moveFile,
  unlinkFile,
  handleImages,
} = require('../../../utils/helpers');

var querystr = '',
  queryvalue = [];
exports.getAllListBrands = async (req, res, next) => {
  try {
    querystr = 'SELECT * FROM brands';

    const brands = await DBquery(querystr);

    return res.render('admin/car/brand/index', {
      datas: brands,
      title: 'Brand List',
      currentPage: 'admin-brand-list',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddBrands = async (req, res, next) => {
  try {
    return res.render('admin/car/brand/add', {
      data: {},
      title: 'Add Brands',
      currentPage: 'admin-brand-add',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

exports.addBrands = async (req, res, next) => {
  try {
    const { name, is_featured } = req.body;

    if (!req.file) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Please upload an image. It is required for this operation.',
      };
      return res.redirect('/admin/add-brands');
    }

    const props = {
      oldpath: null,
      fileName: name,
      newDir: 'assets/images/brands',
      path: 'images/brands',
      uploadPath: req.file.path,
      ext: '.webp',
    };

    const image = await handleImages(props);

    if (image.success) {
      const querystr =
        'INSERT INTO brands (name, image_path, is_featured) VALUES (?,?,?)';
      const queryvalue = [name, image.path, is_featured];

      await DBquery(querystr, queryvalue);

      req.session.alert = {
        type: 'alert-success',
        message: 'Brands added successfully!',
      };
      return res.redirect('/admin/cars-brands');
    } else {
      throw new Error(image.message);
    }
  } catch (error) {
    next(error);
  }
};

exports.getEditBrands = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log('id', id);
    querystr = 'SELECT * FROM brands WHERE id = ?';
    queryvalue = [id];
    await DBquery(querystr, queryvalue).then((onres) => {
      console.log(onres.length);
      if (onres.length == 0) {
        throw new Error('Brands Not Found');
      }

      return res.render('admin/car/brand/edit', {
        data: onres[0],
        title: 'Edit brands',
        currentPage: 'admin-edit-brand',
        layout: './admin/layouts/layout',
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.editBrands = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, is_featured } = req.body;

    const rows = await DBquery('SELECT image_path FROM brands WHERE id = ?', [
      id,
    ]);
    const oldImagePath = rows[0]?.image_path;

    const fileExtension = '.webp';
    const formattedFileName = formatFileName(name, fileExtension);
    const newDir = path.join(
      __dirname,
      '../../../../public/assets/images/brands'
    );
    const newFilePath = path.join(newDir, formattedFileName);

    if (req.file) {
      const oldPath = req.file.path;

      fs.mkdir(newDir, { recursive: true }, async (err) => {
        if (err) throw new Error('Error creating directory');
        moveFile(oldPath, newFilePath, async (err) => {
          if (err) throw new Error('Error moving file');

          const brand_image = `/assets/images/brands/${formattedFileName}`;

          if (oldImagePath && oldImagePath !== brand_image) {
            const oldImageFullPath = path.join(
              __dirname,
              '../../../../public',
              oldImagePath
            );

            try {
              await unlinkFile(oldImageFullPath);
            } catch (unlinkError) {
              console.error('Error deleting old image:', unlinkError);
            }
          }

          const querystr =
            'UPDATE brands SET name = ?, image_path = ?, is_featured = ? WHERE id = ?';
          const queryvalue = [name, brand_image, is_featured, id];

          await DBquery(querystr, queryvalue);
          res.redirect('/admin/cars-brands');
        });
      });
    } else {
      const brand_image = oldImagePath;

      const querystr =
        'UPDATE brands SET name = ?, image_path = ?, is_featured = ? WHERE id = ?';
      const queryvalue = [name, brand_image, is_featured, id];

      await DBquery(querystr, queryvalue);
      res.redirect('/admin/cars-brands');
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteBrands = async (req, res, next) => {
  try {
    const id = req.params.id;

    const cars = await DBquery('SELECT * FROM cars WHERE b_id = ?', [id]);
    const models = await DBquery('SELECT * FROM models WHERE brand_id = ?', [
      id,
    ]);
    const generations = await DBquery(
      'SELECT * FROM generations WHERE model_id = ?',
      [models[0]?.id]
    );

    if (cars.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Cannot delete brand because there are associated cars.',
      };
      return res.redirect('/admin/cars-brands');
    }
    if (generations.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Cannot delete brand because there are associated generations',
      };
      return res.redirect('/admin/cars-brands');
    }
    if (models.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Cannot delete brand because there are associated models',
      };
      return res.redirect('/admin/cars-brands');
    }

    const brand = await DBquery('SELECT image_path FROM brands WHERE id = ?', [
      id,
    ]);
    const oldImagePath = brand[0]?.image_path;

    const querystr = 'DELETE FROM brands WHERE id = ?';
    const queryvalue = [id];
    await DBquery(querystr, queryvalue);

    if (oldImagePath) {
      const oldImageFullPath = path.join(
        __dirname,
        '../../../../public',
        oldImagePath
      );

      await unlinkFile(oldImageFullPath);
    }

    req.session.alert = {
      type: 'alert-success',
      message: 'Brands Deleted Succesfully',
    };

    res.redirect('/admin/cars-brands');
  } catch (error) {
    console.error(error);
    next(error);
  }
};
