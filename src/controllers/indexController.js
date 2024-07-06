const db = require('../../db');
const query = require('../store/query');

exports.getAllBrands = async (req, res) => {
  try {
    let searchTerm = req.query.q || '';

    const [datas] = await db.query(query.brands.getAllBrands, [
      `%${searchTerm}%`,
    ]);

    res.render('brands', {
      brands: datas,
      title: 'Brands Lists',
      currentPage: 'brands',
      searchTerm: searchTerm,
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

//models
exports.getModelByBrand = async (req, res) => {
  try {
    let brand_id = req.params.brand_id;

    const [datas] = await db.query(query.models.getModelByBrand, [brand_id]);

    res.render('models', {
      models: datas,
      title: 'Models',
      currentPage: 'models',
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

exports.getGenerationByModel = async (req, res) => {
  try {
    let model_id = req.params.model_id;

    const [datas] = await db.query(
      query.generations.getGenerationByModelQuery,
      [model_id],
    );

    res.render('generations', {
      generations: datas,
      title: 'Generations',
      currentPage: 'generations',
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};
