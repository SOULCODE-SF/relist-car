const {
  DBquery,
  getConnection,
  commitTransaction,
  rollbackTransaction,
  releaseConnection,
} = require('../../utils/database');
const path = require('path');
const fs = require('fs');
const { formatFileName, moveFile } = require('../../utils/helpers');

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

    req.body.site_name = req.body.site_name.trim();
    req.body.site_url = req.body.site_url.trim();
    req.body.about_site = req.body.about_site.trim();
    req.body.disclaimer_text = req.body.disclaimer_text.trim();
    req.body.copyright_text = req.body.copyright_text.trim();
    req.body.meta_title = req.body.meta_title.trim();
    req.body.meta_description = req.body.meta_description.trim();

    connection = await getConnection();
    await connection.beginTransaction();

    const rows = await DBquery('SELECT logo FROM setting LIMIT 1');
    let site_logo = rows[0]?.logo;

    if(req.file){
      const oldImagePath = site_logo
      const fileExtension = '.webp';
      const formattedFileName = formatFileName('site_logo', fileExtension);
      const newDir = path.join(
        __dirname,
        '../../../public/assets/images/setting'
      );
      const newFilePath = path.join(newDir, formattedFileName);
      
      site_logo = `/assets/images/setting/${formattedFileName}`;
      const oldPath = req.file.path;
  
        fs.mkdir(newDir, { recursive: true }, async (err) => {
          if (err) throw new Error('Error creating directory');
          moveFile(oldPath, newFilePath, async (err) => {
            if (err) throw new Error('Error moving file');
  
            
  
            if (oldImagePath && oldImagePath !== site_logo) {
              const oldImageFullPath = path.join(
                __dirname,
                '../../../../public',
                oldImagePath
              );
  
              try {
                await unlinkFile(oldImageFullPath);
              } catch (unlinkError) {
                console.error('Error deleting old image:', unlinkError);
              }
            }
          });
        });
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
                        logo = ?,
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
      site_logo,
      sosmed_facebook,
      sosmed_twitter,
      sosmed_instagram,
      sosmed_youtube,
      1,
    ];
    await DBquery(querystr, queryvalue);

    await commitTransaction(connection);

    res.redirect('/admin/setting');
  } catch (error) {
    if (connection) await rollbackTransaction(connection);

    console.error(error);
    res.status(500).json('Internal Server Error');
  } finally {
    if (connection) await releaseConnection(connection);
  }
};
