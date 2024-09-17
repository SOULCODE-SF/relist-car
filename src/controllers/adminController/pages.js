const {
  DBquery,
  getConnection,
  commitTransaction,
  rollbackTransaction,
} = require('../../utils/database');
const { handleImages, unlinkFile } = require('../../utils/helpers');
const path = require('path');

var querystr = '',
  queryvalue = [];

const getAllPages = async (req, res, next) => {
  try {
    querystr = 'SELECT * FROM pages';
    const datas = await DBquery(querystr);

    res.render('admin/page/index', {
      datas,
      title: 'Pages',
      currentPage: 'pages',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

const addCustomPage = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      content,
      meta_title,
      meta_description,
      image_alt_tag,
      sort_order,
      status,
      date_published,
    } = req.body;

    let querystr = 'SELECT * FROM pages WHERE slug = ?';
    let cekSlug = await DBquery(querystr, [slug]);
    if (cekSlug.length > 0) {
      return res.status(400).json({ slug: 'Slug already used' });
    }

    let queryvalue;
    if (req.file) {
      const props = {
        oldpath: null,
        fileName: slug,
        newDir: 'assets/images/pages',
        path: 'assets/images/pages',
        uploadPath: req.file.path,
        ext: '.webp',
      };

      const image = await handleImages(props);

      querystr = `
        INSERT INTO pages(
          title, slug, content, meta_title, meta_description, img_alt_tag,
          sort_order, status, date_published, image_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      queryvalue = [
        title,
        slug,
        content,
        meta_title,
        meta_description,
        image_alt_tag,
        sort_order,
        status ? 1 : 0,
        date_published,
        image.path,
      ];
    } else {
      querystr = `
        INSERT INTO pages(
          title, slug, content, meta_title, meta_description, img_alt_tag,
          sort_order, status, date_published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      queryvalue = [
        title,
        slug,
        content,
        meta_title,
        meta_description,
        image_alt_tag,
        sort_order,
        status ? 1 : 0,
        date_published,
      ];
    }

    console.log(queryvalue);

    await DBquery(querystr, queryvalue);

    req.session.alert = {
      type: 'alert-success',
      message: 'Page added successfully!',
    };
    return res.redirect('/admin/pages');
  } catch (error) {
    next(error);
  }
};

const getEditPage = async (req, res, next) => {
  const { id } = req.params;
  try {
    const querystr = 'SELECT * FROM pages WHERE id = ?';
    const page = await DBquery(querystr, [id]);

    if (page.length === 0) {
      return res.status(404).render('404', { message: 'Page not found' });
    }

    res.render('admin/page/edit-page', {
      data: page[0],
      currentPage: 'edit-pages',
      title: 'Pages',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

const editCustomPage = async (req, res, next) => {
  const id = req.params.id;
  try {
    const {
      title,
      slug,
      content,
      meta_title,
      meta_description,
      image_alt_tag,
      sort_order,
      status,
      date_published,
    } = req.body;

    let querystr = 'SELECT * FROM pages WHERE slug = ? AND id != ?';
    let cekSlug = await DBquery(querystr, [slug, id]);
    if (cekSlug.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Slug is already in use',
      };
      return res.redirect(`/admin/edit-pages/${id}`);
    }

    querystr = 'SELECT * FROM pages WHERE sort_order = ? AND id != ?';
    let cekSortOrder = await DBquery(querystr, [sort_order, id]);
    if (cekSortOrder.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Sort order is already in use',
      };
      return res.redirect(`/admin/edit-pages/${id}`);
    }

    let queryvalue;
    let imagePath = null;

    if (req.file) {
      const props = {
        oldpath: null,
        fileName: slug,
        newDir: 'assets/images/pages',
        path: 'assets/images/pages',
        uploadPath: req.file.path,
        ext: '.webp',
      };

      const image = await handleImages(props);
      imagePath = image.path;
    }

    if (imagePath) {
      querystr = `
        UPDATE pages SET
          title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, img_alt_tag = ?,
          sort_order = ?, status = ?, date_published = ?, image_path = ?
        WHERE id = ?
      `;

      queryvalue = [
        title,
        slug,
        content,
        meta_title,
        meta_description,
        image_alt_tag,
        sort_order,
        status ? 1 : 0,
        date_published,
        imagePath,
        id,
      ];
    } else {
      querystr = `
        UPDATE pages SET
          title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, img_alt_tag = ?,
          sort_order = ?, status = ?, date_published = ?
        WHERE id = ?
      `;

      queryvalue = [
        title,
        slug,
        content,
        meta_title,
        meta_description,
        image_alt_tag,
        sort_order,
        status ? 1 : 0,
        date_published,
        id,
      ];
    }

    console.log(queryvalue, querystr);
    await DBquery(querystr, queryvalue);

    req.session.alert = {
      type: 'alert-success',
      message: 'Page updated successfully!',
    };

    console.log('sini');
    return res.redirect('/admin/pages');
  } catch (error) {
    next(error);
  }
};

const deleteCustomPage = async (req, res, next) => {
  const id = req.params.id;
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const post = await DBquery('SELECT image_path FROM pages WHERE id = ?', [
      id,
    ]);

    req.session.alert = {
      type: 'alert-success',
      message: 'Post deleted successfully!',
    };

    const oldImagePath = post[0].image_path;
    if (oldImagePath) {
      const oldImageFullPath = path.join(
        __dirname,
        '../../../public',
        oldImagePath,
      );

      await unlinkFile(oldImageFullPath);
    }

    querystr = 'DELETE FROM pages WHERE id = ?';
    await DBquery(querystr, [id]);

    await commitTransaction(connection);

    req.session.alert = {
      type: 'alert-success',
      message: 'Pages deleted successfully!',
    };
    res.redirect('/admin/pages');
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    next(error);
  }
};

module.exports = {
  getAllPages,
  addCustomPage,
  getEditPage,
  editCustomPage,
  deleteCustomPage,
};
