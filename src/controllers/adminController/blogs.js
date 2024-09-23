const { beginTransaction } = require('../../config/db');
const {
  DBquery,
  getConnection,
  rollbackTransaction,
  commitTransaction,
} = require('../../utils/database');
const {
  handleImages,
  unlinkFile,
  unlinkFileV2,
} = require('../../utils/helpers');
const path = require('path');

var querystr = '',
  queryvalue = [];

const createSlug = (name) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/:/g, '');
};

const getAllPosts = async (req, res, next) => {
  try {
    querystr =
      'SELECT p.*, pc.name as category FROM posts p JOIN post_categories pc ON pc.id = p.category_id';
    const datas = await DBquery(querystr);

    res.render('admin/blogs/posts/index', {
      datas,
      title: 'Blogs',
      currentPage: 'blog-posts',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

const getAddPosts = async (req, res, next) => {
  try {
    res.render('admin/blogs/posts/add', {
      data: {},
      title: 'Blogs',
      currentPage: 'blog-posts',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

const addPosts = async (req, res, next) => {
  try {
    const {
      title,
      category_id,
      status,
      content,
      slug,
      meta_title,
      meta_description,
      date_published,
    } = req.body;
    const tags = req.body.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    console.log(tags);
    const tagsString = tags.join(', ');

    console.log(tagsString);
    if (!req.file) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Please upload an image. It is required for this operation.',
      };
      return res.redirect('/admin/blog/posts');
    }

    const image_name = title.toLowerCase().replace(/ /g, '-');
    const props = {
      oldpath: null,
      fileName: image_name,
      newDir: 'assets/images/posts',
      path: 'assets/images/posts',
      uploadPath: req.file.path,
      ext: '.webp',
    };

    const image = await handleImages(props);

    if (image.success) {
      const querystr =
        'INSERT INTO posts (title, image_path, content, category_id, status, slug, date_published, meta_title, meta_description, tags) VALUES (?,?,?,?,?,?,?,?,?,?)';
      const queryvalue = [
        title,
        image.path,
        content,
        category_id,
        status ? 1 : 0,
        slug,
        date_published,
        meta_title,
        meta_description,
        tagsString,
      ];

      await DBquery(querystr, queryvalue);

      req.session.alert = {
        type: 'alert-success',
        message: 'Posts added successfully!',
      };
      return res.redirect('/admin/blog/posts');
    } else {
      throw new Error(image.message);
    }
  } catch (error) {
    next(error);
  }
};

const getEditPosts = async (req, res, next) => {
  const id = req.params.id;
  try {
    querystr =
      'SELECT p.*, pc.name as category FROM posts p JOIN post_categories pc ON pc.id = p.category_id WHERE p.id = ?';
    const posts = await DBquery(querystr, [id]);
    let data = posts[0];
    const tagsArray = JSON.parse(posts[0].tags);

    if (tagsArray) {
      data.tags = tagsArray.map((item) => item.value).join(', ');
    }

    console.log(data);
    res.render('admin/blogs/posts/edit', {
      data,
      title: 'Blogs',
      currentPage: 'blog-posts',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

const editPosts = async (req, res, next) => {
  const post_id = req.params.id;
  try {
    let {
      title,
      category_id,
      post_status,
      content,
      meta_title,
      meta_description,
    } = req.body;
    if (!post_id) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Post ID is required for updating a post.',
      };
      return res.redirect('/admin/blog/posts');
    }
    const tags = req.body.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    const tagsString = tags.join(', ');

    let imagePath = null;
    const getPosts = await DBquery(
      'SELECT image_path, category_id FROM posts WHERE id = ?',
      [post_id]
    );
    if (!category_id) {
      category_id = getPosts[0].category_id;
    }
    if (req.file) {
      const image_name = title.toLowerCase().replace(/ /g, '-');
      const props = {
        oldpath: null,
        fileName: image_name,
        newDir: 'assets/images/posts',
        path: 'images/posts',
        uploadPath: req.file.path,
        ext: '.webp',
      };

      const image = await handleImages(props);

      if (image.success) {
        imagePath = image.path;
      } else {
        throw new Error(image.message);
      }
    } else {
      imagePath = getPosts[0].image_path;
    }

    // Update the post in the database
    const querystr = `
        UPDATE posts
        SET title = ?, content = ?, category_id = ?, status = ? ,image_path = ?, meta_title = ? , meta_description = ?, tags = ?
        WHERE id = ?
      `;
    const queryvalue = [
      title,
      content,
      parseInt(category_id),
      post_status ? 1 : 0,
      imagePath,
      meta_title,
      meta_description,
      tagsString,
      post_id,
    ];

    console.log(queryvalue);

    await DBquery(querystr, queryvalue);

    req.session.alert = {
      type: 'alert-success',
      message: 'Post updated successfully!',
    };
    return res.redirect('/admin/blog/posts');
  } catch (error) {
    next(error);
  }
};

const deletePosts = async (req, res, next) => {
  const id = req.params.id;
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const post = await DBquery('SELECT image_path FROM posts WHERE id = ?', [
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
        '../../../public/assets',
        oldImagePath
      );

      await unlinkFile(oldImageFullPath);
    }

    querystr = 'DELETE FROM posts WHERE id = ?';
    await DBquery(querystr, [id]);

    await commitTransaction(connection);

    req.session.alert = {
      type: 'alert-success',
      message: 'Post deleted successfully!',
    };
    res.redirect('/admin/blog/posts');
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    next(error);
  }
};

//categories
const getAllCategories = async (req, res, next) => {
  try {
    querystr = 'SELECT * FROM post_categories';
    const datas = await DBquery(querystr);

    res.render('admin/blogs/categories/index', {
      datas,
      title: 'Blogs Categories',
      currentPage: 'blog-categories',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

const getAddCategories = async (req, res, next) => {
  try {
    res.render('admin/blogs/categories/add', {
      data: {},
      title: 'Blogs Categories',
      currentPage: 'blog-categories',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

const addCategories = async (req, res, next) => {
  const { name } = req.body;
  console.log('sini');
  try {
    querystr = 'SELECT * FROM post_categories WHERE name = ?';
    const cekCategories = await DBquery(querystr, [name]);

    if (cekCategories.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Category name already exist',
      };

      return res.redirect('/admin/blog/categories');
    }

    querystr = 'INSERT INTO post_categories(name) VALUES(?)';
    await DBquery(querystr, [name]);

    res.redirect('/admin/blog/categories');
  } catch (error) {
    next(error);
  }
};

const getUpdateCategories = async (req, res, next) => {
  const id = req.params.id;
  try {
    querystr = 'SELECT * FROM post_categories WHERE id = ?';
    const cekCategories = await DBquery(querystr, [id]);

    res.render('admin/blogs/categories/edit', {
      data: cekCategories[0],
      title: 'Blogs Categories',
      currentPage: 'blog-categories',
      layout: './admin/layouts/layout',
    });
  } catch (error) {
    next(error);
  }
};

const updateCategories = async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  const { name } = req.body;
  try {
    querystr = 'SELECT * FROM post_categories WHERE id = ?';
    const cekCategories = await DBquery(querystr, [id]);

    if (cekCategories.length === 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Category not found',
      };
    }

    querystr = 'UPDATE post_categories SET name = ? WHERE id = ?';
    queryvalue = [name, id];

    await DBquery(querystr, queryvalue);

    res.redirect('/admin/blog/categories');
  } catch (error) {
    next(error);
  }
};

const deleteCategories = async (req, res, next) => {
  const id = req.params.id;
  try {
    querystr = 'DELETE FROM post_categories WHERE id = ?';
    await DBquery(querystr, [id]);

    res.redirect('/admin/blog/categories');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosts,
  getAddPosts,
  addPosts,
  getEditPosts,
  editPosts,
  deletePosts,
  getAllCategories,
  getAddCategories,
  addCategories,
  getUpdateCategories,
  updateCategories,
  deleteCategories,
};
