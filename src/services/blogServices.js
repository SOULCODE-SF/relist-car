const { DBquery } = require('../utils/database');

var querystr = '',
  queryvalue = [];

const getCategoriesBlog = async (req, res, next) => {
  try {
    querystr = 'SELECT * FROM post_categories';
    const datas = await DBquery(querystr);

    return res.status(200).json({ datas });
  } catch (error) {
    next(error);
  }
};

const cekSlugExist = async (req, res, next) => {
  const slug = req.query.slug;
  try {
    querystr = 'SELECT * FROM posts WHERE slug = ?';
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
  getCategoriesBlog,
  cekSlugExist,
};