const db = require('../../db');
const nodecache = require('node-cache');

const cache = new nodecache();

const getSiteInfo = async () => {
  try {
    const [data] = await db.query('SELECT * FROM setting LIMIT 1');

    return data[0];
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

async function siteInfoMiddleware(req, res, next) {
  try {
    const key = 'site_info'; // Use a fixed key for site info as it's the same for all requests
    let data = cache.get(key);

    if (!data) {
      console.log('Cache miss'); // Log cache misses for debugging
      data = await getSiteInfo();
      cache.set(key, data, 86000); // Cache for 86000 seconds (approximately 1 day)
    } else {
      console.log('Cache hit'); // Log cache hits for debugging
    }

    res.locals.meta_title = data.meta_title;
    res.locals.meta_description = data.meta_description;
    res.locals.site_name = data.site_name;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = siteInfoMiddleware;
