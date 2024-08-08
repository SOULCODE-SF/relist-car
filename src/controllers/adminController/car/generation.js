const path = require('path');
const fs = require('fs');
const { DBquery } = require('../../../utils/database');
const {
  formatFileName,
  moveFile,
  unlinkFile,
} = require('../../../utils/helpers');

var querystr = '',
  queryvalue = [];

exports.getAllGenerationList = async (req, res, next) => {
  try {
    const brandId = req.query.brand_id || 1;

    querystr =
      'SELECT g.id, g.title as name, g.flag, b.name as brand, m.name as model, g.image_path FROM generations g JOIN models m ON m.id = g.model_id JOIN brands b ON m.brand_id = b.id WHERE b.id = ?';
    queryvalue = [brandId];

    await DBquery(querystr, queryvalue).then((resp) => {
      return res.render('admin/car/generation/index', {
        datas: resp,
        title: 'Generation List',
        currentPage: 'admin-generation-list',
        layout: './admin/layouts/layout',
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddGeneration = async (req, res, next) => {
  try {
    return res.render('admin/car/generation/add', {
      data: {},
      title: 'Add Generation',
      currentPage: 'admin-genration-add',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

exports.addGeneration = async (req, res, next) => {
  try {
    const { brand_id, model_id, name, flag } = req.body;
    let iserror = false;
    if (!brand_id) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Brand is required',
      };
      iserror = true;
    } else if (!model_id) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Model is required',
      };
      iserror = true;
    } else if (!req.file) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Image is required',
      };
      iserror = true;
    }

    if (iserror) return res.redirect('/admin/add-generations');

    let brand_name;
    let model_name;
    querystr =
      'SELECT m.name as model, b.name as brand FROM models m JOIN brands b ON m.brand_id = b.id WHERE m.id = ?';
    queryvalue = [model_id];
    await DBquery(querystr, queryvalue).then((onres) => {
      if (onres.length == 0) {
        throw new Error('Brands And Model Not Found!');
      }
      brand_name = onres[0].brand;
      model_name = onres[0].model;
      brand_name = brand_name.toLowerCase().replace(/\s+/g, '-');
      model_name = model_name.toLowerCase().replace(/\s+/g, '-');
    });

    const fileExtension = '.webp';
    const formattedFileName = formatFileName(name, fileExtension);
    const oldPath = req.file.path;
    const newDir = path.join(
      __dirname,
      `../../../../public/assets/images/brands/${brand_name}/${model_name}`
    );
    const newFilePath = path.join(newDir, formattedFileName);

    fs.mkdir(newDir, { recursive: true }, (err) => {
      if (err) throw new Error('Error creating directory');

      moveFile(oldPath, newFilePath, async (err) => {
        if (err) throw new Error('Error moving file');

        const model_image = `/assets/images/brands/${brand_name}/${model_name}/${formattedFileName}`;

        const querystr =
          'INSERT INTO generations (title, image_path, model_id, flag) VALUES (?,?,?,?)';
        const queryvalue = [name, model_image, model_id, flag];

        await DBquery(querystr, queryvalue);

        res.redirect(`/admin/model-generations?brand_id=${brand_id}`);
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.getEditGenaration = async (req, res, next) => {
  try {
    const id = req.params.id;

    querystr =
      'SELECT g.id, g.title as name, b.name as brand, m.name as model, g.image_path FROM generations g JOIN models m ON m.id = g.model_id JOIN brands b ON m.brand_id = b.id WHERE g.id = ?';
    queryvalue = [id];

    await DBquery(querystr, queryvalue).then((onres) => {
      if (onres.length == 0) {
        throw new Error('Generation Not Found!');
      }

      return res.render('admin/car/generation/edit', {
        data: onres[0],
        title: 'Edit generations',
        currentPage: 'admin-edit-generations',
        layout: './admin/layouts/layout',
      });
    });
  } catch (error) {
    next(error);
  }
};

exports.editGenerations = async (req, res, next) => {
  try {
    const id = req.params.id;
    let { brand_id, model_id, name, flag } = req.body;

    const rows = await DBquery(
      'SELECT g.image_path, m.id as model_id, m.name as model, b.id as brand_id, b.name as brand FROM generations g JOIN models m ON m.id = g.model_id JOIN brands b ON m.brand_id = b.id WHERE g.id = ?',
      [id]
    );

    if (!model_id) {
      model_id = rows[0].model_id;
    }

    const oldImagePath = rows[0]?.image_path;
    let brand_name = rows[0]?.brand;
    let model_name = rows[0]?.model;
    brand_name = brand_name.toLowerCase().replace(/\s+/g, '-');
    model_name = model_name.toLowerCase().replace(/\s+/g, '-');

    const fileExtension = '.webp';
    const formattedFileName = formatFileName(name, fileExtension);
    const newDir = path.join(
      __dirname,
      `../../../../public/assets/images/brands/${brand_name}/${model_name}`
    );
    const newFilePath = path.join(newDir, formattedFileName);

    if (req.file) {
      const oldPath = req.file.path;

      fs.mkdir(newDir, { recursive: true }, async (err) => {
        if (err) throw new Error('Error creating directory');
        moveFile(oldPath, newFilePath, async (err) => {
          if (err) throw new Error('Error moving file');

          const generation_image = `/assets/images/brands/${brand_name}/${model_name}/${formattedFileName}`;

          if (oldImagePath && oldImagePath !== generation_image) {
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

          const querystr =
            'UPDATE generations SET title = ?, image_path = ?, model_id = ?, flag = ? WHERE id = ?';
          const queryvalue = [name, generation_image, model_id, flag, id];

          await DBquery(querystr, queryvalue);

          req.session.alert = {
            type: 'alert-success',
            message: 'Generation Update Success',
          };
          res.redirect(`/admin/edit-generations/${id}`);
        });
      });
    } else {
      const generation_image = oldImagePath;

      const querystr =
        'UPDATE generations SET title = ?, image_path = ?, model_id = ?, flag = ? WHERE id = ?';
      const queryvalue = [name, generation_image, brand_id, flag, id];

      await DBquery(querystr, queryvalue);

      req.session.alert = {
        type: 'alert-success',
        message: 'Generation Update Success',
      };
      res.redirect(`/admin/edit-generations/${id}`);
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteGeneration = async (req, res, next) => {
  try {
    const id = req.params.id;

    const rows = await DBquery(
      'SELECT image_path FROM generations WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Generation not found!');
    }

    const oldImagePath = rows[0]?.image_path;

    const querystr = 'DELETE FROM generations WHERE id = ?';
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
      message: 'Generation successfully deleted',
    };
    res.redirect('/admin/model-generations');
  } catch (error) {
    next(error);
  }
};
