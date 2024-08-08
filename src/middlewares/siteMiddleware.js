const nodecache = require('node-cache');
const { DBquery } = require('../utils/database');

const cache = new nodecache();

const getSiteInfo = async () => {
  try {
    const res = await DBquery('SELECT * FROM setting LIMIT 1');

    return res[0];
  } catch (error) {
    console.error(error);
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
      cache.set(key, data, 86000);
    }

    res.locals.meta_title = data.meta_title;
    res.locals.meta_description = data.meta_description;
    res.locals.site_name = data.site_name;
    res.locals.site_url = data.site_url;

    res.locals.alert = req.session.alert;
    req.session.alert = null;

    res.locals.session = req.session;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = siteInfoMiddleware;
