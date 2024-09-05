const {
  DBquery,
  getConnection,
  commitTransaction,
  rollbackTransaction,
  releaseConnection,
} = require('../../utils/database');
const path = require('path');
const fs = require('fs');
const {
  formatFileName,
  moveFile,
  handleImages,
} = require('../../utils/helpers');

exports.getSettingPage = async (req, res) => {
  try {
    let querystr = 'SELECT * FROM setting LIMIT 1';
    const [setting] = await DBquery(querystr);

    res.render('admin/setting/index', {
      title: 'Setting',
      data: setting,
      currentPage: 'setting',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.updateSetting = async (req, res, next) => {
  let connection;
  try {
    const {
      site_name,
      site_url,
      about_site,
      disclaimer_text,
      copyright_text,
      meta_title,
      meta_description,
      sosmed_facebook,
      sosmed_twitter,
      sosmed_instagram,
      sosmed_youtube,
      adsense_gtm,
      hitstat_code,
      richsnippet_code,
    } = req.body;

    req.body.site_name = req.body.site_name.trim();
    req.body.site_url = req.body.site_url.trim();
    req.body.about_site = req.body.about_site.trim();
    req.body.disclaimer_text = req.body.disclaimer_text.trim();
    req.body.copyright_text = req.body.copyright_text.trim();
    req.body.meta_title = req.body.meta_title.trim();
    req.body.meta_description = req.body.meta_description.trim();

    connection = await getConnection();
    await connection.beginTransaction();

    const rows = await DBquery('SELECT logo, favicon FROM setting LIMIT 1');
    let site_logo = rows[0]?.logo;
    let favicon = rows[0]?.favicon;

    console.log(req.files);
    if (req.files) {
      if (req.files.site_logo) {
        const propsLogo = {
          oldpath: site_logo,
          fileName: 'site_logo',
          newDir: 'assets/images/setting',
          path: '/assets/images/setting',
          uploadPath: req.files.site_logo[0].path,
          ext: '.webp',
        };

        const logo = await handleImages(propsLogo);
        if (!logo.success) {
          throw new Error(logo.message);
        }
        site_logo = logo.path;
      }
      if (req.files.favicon) {
        const propsFavicon = {
          oldpath: favicon,
          fileName: 'favicon',
          newDir: 'assets/images/setting',
          path: '/assets/images/setting',
          uploadPath: req.files.favicon[0].path,
          ext: '.ico',
        };

        const upFavicon = await handleImages(propsFavicon);
        if (!upFavicon.success) {
          throw new Error(upFavicon.message);
        }
        favicon = upFavicon.path;
        console.log(favicon);
      }
    }

    let querystr = `UPDATE setting
                      SET 
                        site_name = ?,
                        site_url = ?,
                        about_site = ?,
                        disclaimer = ?,
                        copyright = ?,
                        meta_title = ?,
                        meta_description = ?,
                        favicon = ?,
                        logo = ?,
                        facebook_url = ?,
                        twitter_url = ?,
                        instagram_url = ?,
                        youtube_url = ?,
                        adsense_gtm = ?,
                        hitstat_code = ?,
                        richsnippet_code = ?
                      WHERE id = ?; 
                    `;
    let queryvalue = [
      site_name,
      site_url,
      about_site,
      disclaimer_text,
      copyright_text,
      meta_title,
      meta_description,
      favicon,
      site_logo,
      sosmed_facebook,
      sosmed_twitter,
      sosmed_instagram,
      sosmed_youtube,
      adsense_gtm,
      hitstat_code,
      richsnippet_code,
      1,
    ];
    await DBquery(querystr, queryvalue);

    await commitTransaction(connection);

    res.redirect('/admin/setting');
  } catch (error) {
    if (connection) await rollbackTransaction(connection);

    console.error(error);
    next(error);
  } finally {
    if (connection) await releaseConnection(connection);
  }
};
