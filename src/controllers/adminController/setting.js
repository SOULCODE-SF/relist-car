const db = require('../../../db');

exports.getSettingPage = async (req, res) => {
  try {
    let querystr = 'SELECT * FROM setting LIMIT 1';
    const [setting] = await db.query(querystr);

    console.log(setting[0]);
    res.render('admin/setting/index', {
      title: 'Setting',
      data: setting[0],
      currentPage: 'setting',
      layout: './admin/layouts/layout',
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

    res.redirect('/admin/setting');
  } catch (error) {
    if (connection) await connection.rollback();

    console.error(error);
    res.status(500).json('Internal Server Error');
  } finally {
    if (connection) await connection.release();
  }
};
