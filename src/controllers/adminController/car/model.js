const {
  formatFileName,
  moveFile,
  unlinkFile,
} = require('../../../utils/helpers');
const path = require('path');
const fs = require('fs');
const { DBquery } = require('../../../utils/database');

var querystr = '',
  queryvalue = [];

exports.getAllModelList = async (req, res, next) => {
  try {
    querystr =
      'SELECT m.id, m.name, m.image_path, b.id as brand_id, b.name as brand_name FROM models m JOIN brands b ON m.brand_id = b.id;';
    queryvalue = [];
    const models = await DBquery(querystr, queryvalue);

    return res.render('admin/car/model/index', {
      datas: models,
      title: 'List Model',
      currentPage: 'list-car-model',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddModel = async (req, res, next) => {
  try {
    return res.render('admin/car/model/add', {
      data: {},
      title: 'Add Model',
      currentPage: 'add-car-model',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

exports.addModel = async (req, res, next) => {
  try {
    const { brand_id, name } = req.body;
    let iserror = false;
    if (!brand_id) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Brand is required',
      };
      iserror = true;
    } else if (!req.file) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Image is required',
      };
      iserror = true;
    }

    if (iserror) return res.redirect('/admin/add-models');

    let brand_name;
    querystr = 'SELECT name FROM brands WHERE id = ?';
    queryvalue = [brand_id];
    await DBquery(querystr, queryvalue).then((onres) => {
      if (onres.length == 0) {
        throw new Error('Brands Not Found!');
      }
      brand_name = onres[0].name;
      brand_name = brand_name.toLowerCase().replace(/\s+/g, '-');
    });

    const fileExtension = '.webp';
    const formattedFileName = formatFileName(name, fileExtension);
    const oldPath = req.file.path;
    const newDir = path.join(
      __dirname,
      `../../../../public/assets/images/brands/${brand_name}`
    );
    const newFilePath = path.join(newDir, formattedFileName);

    fs.mkdir(newDir, { recursive: true }, (err) => {
      if (err) throw new Error('Error creating directory');

      moveFile(oldPath, newFilePath, async (err) => {
        if (err) throw new Error('Error moving file');

        const model_image = `/images/brands/${brand_name}/${formattedFileName}`;

        const querystr =
          'INSERT INTO models (name, image_path, brand_id) VALUES (?,?,?)';
        const queryvalue = [name, model_image, brand_id];

        await DBquery(querystr, queryvalue);

        res.redirect('/admin/brand-models');
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.getEditModel = async (req, res, next) => {
  try {
    const id = req.params.id;

    querystr =
      'SELECT m.id, m.name, m.image_path, b.id as brand_id, b.name as brand_name FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.id = ?';
    queryvalue = [id];

    await DBquery(querystr, queryvalue).then((onres) => {
      if (onres.length == 0) {
        throw new Error('Model Not Found!');
      }

      return res.render('admin/car/model/edit', {
        data: onres[0],
        title: 'Edit models',
        currentPage: 'edit-car-model',
        layout: './admin/layouts/layout',
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.editModels = async (req, res, next) => {
  try {
    const id = req.params.id;
    let { brand_id, name } = req.body;

    const rows = await DBquery(
      'SELECT m.image_path, b.name as b_name, m.brand_id FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.id = ?',
      [id]
    );

    if (!brand_id) {
      brand_id = rows[0].brand_id;
    }
    const oldImagePath = rows[0]?.image_path;
    let brand_name = rows[0]?.b_name;
    brand_name = brand_name.toLowerCase().replace(/\s+/g, '-');

    const fileExtension = '.webp';
    const formattedFileName = formatFileName(name, fileExtension);
    const newDir = path.join(
      __dirname,
      `../../../../public/assets/images/brands/${brand_name}`
    );
    const newFilePath = path.join(newDir, formattedFileName);

    if (req.file) {
      const oldPath = req.file.path;

      fs.mkdir(newDir, { recursive: true }, async (err) => {
        if (err) throw new Error('Error creating directory');
        moveFile(oldPath, newFilePath, async (err) => {
          if (err) throw new Error('Error moving file');

          const model_image = `/images/brands/${brand_name}/${formattedFileName}`;

          if (oldImagePath && oldImagePath !== model_image) {
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
            'UPDATE models SET name = ?, image_path = ?, brand_id = ? WHERE id = ?';
          const queryvalue = [name, model_image, brand_id, id];

          await DBquery(querystr, queryvalue);

          req.session.alert = {
            type: 'alert-success',
            message: 'Model Update Success',
          };
          res.redirect(`/admin/edit-models/${id}`);
        });
      });
    } else {
      const brand_image = oldImagePath;

      const querystr =
        'UPDATE models SET name = ?, image_path = ?, brand_id = ? WHERE id = ?';
      const queryvalue = [name, brand_image, brand_id, id];

      await DBquery(querystr, queryvalue);

      req.session.alert = {
        type: 'alert-success',
        message: 'Model Update Success',
      };
      res.redirect(`/admin/brands-models`);
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteModel = async (req, res, next) => {
  try {
    const id = req.params.id;

    const rows = await DBquery('SELECT image_path FROM models WHERE id = ?', [
      id,
    ]);

    if (rows.length === 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Model not found',
      };
      return res.redirect('/admin/models');
    }

    const oldImagePath = rows[0]?.image_path;

    const querystr = 'DELETE FROM models WHERE id = ?';
    await DBquery(querystr, [id]);

    if (oldImagePath) {
      const oldImageFullPath = path.join(
        __dirname,
        '../../../../public',
        oldImagePath
      );

      try {
        await unlinkFile(oldImageFullPath);
      } catch (unlinkError) {
        throw new Error(unlinkError);
      }
    }

    req.session.alert = {
      type: 'alert-success',
      message: 'Model successfully deleted',
    };
    res.redirect('/admin/brand-models');
  } catch (error) {
    next(error);
  }
};
