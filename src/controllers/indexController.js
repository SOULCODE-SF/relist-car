const db = require('../../db');
const query = require('../store/query');
const nodecache = require('node-cache');

const cache = new nodecache();

exports.getAllBrands = async (req, res) => {
  try {
    const key = req.originalUrl;
    const cachedData = cache.get(key);

    let searchTerm = req.query.q || '';

    if (cachedData) {
      return res.render('brands', {
        brands: cachedData,
        title: 'Brands Lists',
        currentPage: 'brands',
        searchTerm: searchTerm,
      });
    }

    const [datas] = await db.query(query.brands.getAllBrands, [
      `%${searchTerm}%`,
    ]);

    cache.set(key, datas, 3600);

    res.render('brands', {
      brands: datas,
      title: 'Brands Lists',
      currentPage: 'brands',
      searchTerm: searchTerm,
    });
  } catch (error) {
    console.log(error.message);
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
    console.error(error.message);
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

exports.getGenerationLists = async (req, res) => {
  try {
    let generation_id = req.params.id;
    const [datas] = await db.query('CALL sp_get_generation_list(?)', [
      generation_id,
    ]);

    console.log(datas);

    res.render('generations_list', {
      datas: datas[0],
      title: 'List Generation',
      currentPage: 'list-generation',
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

exports.getSpec = async (req, res) => {
  try {
    let generation_link_id = req.params.id;
    const [datas] = await db.query('CALL get_spec(?)', [generation_link_id]);

    console.log(datas[0][0]);
    res.render('specs', {
      data: datas[0][0],
      title: 'Spec',
      currentPage: 'specs',
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};
