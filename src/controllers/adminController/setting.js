const db = require('../../../db');

exports.getSettingPage = async (req, res) => {
  try {
    res.render('admin/setting/index', {
      title: 'Setting',
      currentPage: 'setting',
      layout: './admin/layouts/layout',
      session: req.session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.updateSetting = async (req, res) => {
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
    } = req.body;

    connection = await db.getConnection();
    await connection.beginTransaction();

    let querystr = `UPDATE setting
                      SET 
                        site_name = ?,
                        site_url = ?,
                        about_site = ?,
                        disclaimer = ?,
                        copyright = ?,
                        meta_title = ?,
                        meta_description = ?,
                        facebook_url = ?,
                        twitter_url = ?,
                        instagram_url = ?,
                        youtube_url = ?
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
      sosmed_facebook,
      sosmed_twitter,
      sosmed_instagram,
      sosmed_youtube,
      1,
    ];
    await connection.query(querystr, queryvalue);

    await connection.commit();

    res.status(200).render('admin/setting/index', {
      title: 'Setting',
      currentPage: 'setting',
      layout: './admin/layouts/layout',
      session: req.session,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error(error);
    res.status(500).json('Internal Server Error');
  } finally {
    if (connection) await connection.release();
  }
};
