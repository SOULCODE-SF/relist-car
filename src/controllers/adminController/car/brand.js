const db = require('../../../../db');
const queryStore = require('../../../store/query');
const path = require('path');
const fs = require('fs');

var querystr = '',
  queryvalue = [];
exports.getAllListBrands = async (req, res) => {
  try {
    querystr = 'SELECT * FROM brands';

    const [brands] = await db.query(querystr);

    return res.render('admin/car/brand/index', {
      datas: brands,
      title: 'Brand List',
      currentPage: 'admin-brand-list',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getAddBrands = async (req, res) => {
  try {
    return res.render('admin/car/brand/add', {
      title: 'Add Brands',
      currentPage: 'admin-brand-add',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const moveFile = (oldPath, newPath, callback) => {
  // Gunakan fs.rename untuk memindahkan file
  fs.rename(oldPath, newPath, (err) => {
    if (err) return callback(err);
    callback(null);
  });
};

const formatFileName = (name, extension) => {
  const formattedName = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .concat(extension);
  return formattedName;
};

exports.addBrands = async (req, res) => {
  try {
    const { name, is_featured } = req.body;

    if (!req.file) {
      return res.status(400).send('File is required');
    }

    const fileExtension = '.webp';
    const formattedFileName = formatFileName(name, fileExtension);
    const oldPath = req.file.path;
    const newDir = path.join(
      __dirname,
      '../../../../public/assets/images/brands'
    );
    const newFilePath = path.join(newDir, formattedFileName);

    console.log(newFilePath);

    fs.mkdir(newDir, { recursive: true }, (err) => {
      if (err) return res.status(500).send('Error creating directory');

      moveFile(oldPath, newFilePath, (err) => {
        if (err) return res.status(500).send('Error moving file');

        const brand_image = `/assets/images/brands/${formattedFileName}`;
        console.log(brand_image);

        const querystr =
          'INSERT INTO brands (name, image_path, is_featured) VALUES (?,?,?)';
        const queryvalue = [name, brand_image, is_featured];

        db.query(querystr, queryvalue);

        res.redirect('/admin/cars-brands');
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
