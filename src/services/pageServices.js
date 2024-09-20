const { DBquery } = require('../utils/database');

const cekSlugPageExist = async (req, res, next) => {
  const slug = req.query.slug;
  try {
    querystr = 'SELECT * FROM pages WHERE slug = ?';
    queryvalue = [slug];

    const cekExist = await DBquery(querystr, queryvalue);
    if (cekExist.length > 0) {
      return res.status(400).json({
        message: 'Slug Already Use',
      });
    } else {
      return res.status(200).json({
        message: 'Slug Available',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  cekSlugPageExist,
};
