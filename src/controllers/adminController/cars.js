const db = require('../../../db');

exports.getBrandsName = async (req, res) => {
  try {
    const brand_name = req.query.q || '';

    const [datas] = await db.query(
      'SELECT id, name FROM brands WHERE name LIKE ?',
      [`%${brand_name[1]}%`],
    );

    return res.json({
      datas,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getModelName = async (req, res) => {
  try {
    const brand_id = req.params.brand_id;
    const [datas] = await db.query(
      'SELECT id, name FROM models WHERE brand_id = ?',
      [brand_id],
    );

    return res.json({
      datas,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.addCar = async (req, res) => {
  try {
    const { brand_name, model_name } = req.body;

    const data = { brand_name, model_name };
    console.log(data);
    return res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
};