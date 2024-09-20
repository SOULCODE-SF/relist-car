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

function getExcerpt(htmlString, maxLength = 156) {
  const text = htmlString.replace(/<\/?[^>]+(>|$)/g, "");

  const excerpt = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  return excerpt;
}

const getContentForMetaDescription = async(slug) => {
  try {
    querystr = 'SELECT content FROM posts WHERE slug = ?'
    const blog = await DBquery(querystr, [slug])

    const excerptContent = getExcerpt(blog[0].content)
    console.log(excerptContent)
    
    return excerptContent
  } catch (error) {
    throw new Error(error.message)
  }
} 

module.exports = {
  getCategoriesBlog,
  cekSlugExist,
  getContentForMetaDescription
};
