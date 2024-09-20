const nodecache = require('node-cache');
const { DBquery } = require('../utils/database');
const { getContentForMetaDescription } = require('../services/blogServices');

const cache = new nodecache();

const getSiteInfo = async () => {
  try {
    const querystr = `
      SELECT
        s.*,
        (SELECT COUNT(*) FROM brands) AS total_brand, 
        (SELECT COUNT(*) FROM models) AS total_model,
        (SELECT COUNT(*) FROM cars) AS total_car
      FROM
        setting s ;
    `;
    const res = await DBquery(querystr);

    return res[0];
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const getListCustomPage = async () => {
  try {
    const querystr =
      'SELECT title, slug FROM pages WHERE status = 1 AND date_published < CURDATE() ORDER BY sort_order ASC, title ASC';
    const page = await DBquery(querystr);

    return page;
  } catch (error) {
    throw new Error(error);
  }
};

async function siteInfoMiddleware(req, res, next) {
  try {
    const key = 'site_info';
    let data = cache.get(key);

    if (!data) {
      console.log('Cache miss');
      data = await getSiteInfo();
      page = await getListCustomPage();
      cache.set(key, data, 86000);
    }

    const dataCookies = data;
    res.locals.memories = dataCookies;
    res.locals.pages = page;
    res.locals.title = 'Default Title'
    res.locals.meta_title = dataCookies.meta_title 
    if (req.path.includes('/blogs/')) {
      const slug = req.path.split('/blogs/')[1];
      res.locals.meta_description = await getContentForMetaDescription(slug)
    } else {
      res.locals.meta_description = dataCookies.meta_description;
    }
    if (req.session.alert) {
      res.locals.alert = req.session.alert;
      delete req.session.alert;
    } else {
      res.locals.alert = null;
    }

    res.locals.session = req.session;

    res.locals.session = req.session;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = siteInfoMiddleware;
