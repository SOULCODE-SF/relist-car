const queryStore = require('../../store/query');
const {
  DBquery,
  getConnection,
  commitTransaction,
  rollbackTransaction,
  releaseConnection,
} = require('../../utils/database');

const bcrypt = require('bcrypt');

var querystr = '',
  queryvalue = [];

const addUsers = async (req, res, next) => {
  let connection;
  try {
    const { username, email, password, role, name, country } = req.body;

    connection = await getConnection();
    await connection.beginTransaction();

    const usernameExist = await DBquery(queryStore.users.cekUsername, [
      username,
    ]);

    let hasAlert = false;

    if (usernameExist.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Username Already Exists',
      };
      hasAlert = true;
    }

    const emailExist = await DBquery(queryStore.users.cekEmail, [email]);

    if (emailExist.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Email Already Exists',
      };
      hasAlert = true;
    }

    if (hasAlert) {
      return res.redirect('/admin/add-users');
    }

    queryvalue = [name, username, email, role, country];
    querystr =
      'INSERT INTO users(name, username, email, role, location) VALUES(?,?,?,?,?);';

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      queryvalue.push(hashedPassword);

      querystr =
        'INSERT INTO users(name, username, email, role, location, password) VALUES(?,?,?,?,?,?);';
    }

    console.log(queryvalue);
    await DBquery(querystr, queryvalue);

    await commitTransaction(connection);

    req.session.alert = {
      type: 'alert-success',
      message: 'User Added Succesfully',
    };

    return res.redirect('/admin/users');
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    next(error);
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};

//page
const getAddUsersPage = async (req, res, next) => {
  try {
    return res.render('admin/user/add', {
      title: 'Add User',
      currentPage: 'users',
      layout: './admin/layouts/layout',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const getUserPage = async (req, res, next) => {
  try {
    querystr = 'SELECT * FROM users;';
    const datas = await DBquery(querystr);

    if (datas) {
      res.render('admin/user/index', {
        title: 'List Users',
        currentPage: 'users',
        layout: './admin/layouts/layout',
        datas,
      });
    }
  } catch (error) {
    next(error);
  }
};

const getEditUsersPage = async (req, res, next) => {
  try {
    const id = req.params.id;
    querystr = 'SELECT * FROM users WHERE id = ?';

    const users = await DBquery(querystr, [id]);
    const data = users[0];

    return res.render('admin/user/edit', {
      title: 'Edit User',
      currentPage: 'users',
      layout: './admin/layouts/layout',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const editUsers = async (req, res, next) => {
  let connection;
  try {
    const userId = req.params.id;
    const { username, email, password, role, name, country } = req.body;

    connection = await getConnection();
    await connection.beginTransaction();

    querystr = 'SELECT username FROM users WHERE username = ? AND id <> ?';
    const usernameExist = await DBquery(querystr, [username, userId]);

    let hasAlert = false;

    if (usernameExist.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Username Already Exists',
      };
      hasAlert = true;
    }

    querystr = 'SELECT email FROM users WHERE username = ? AND id <> ?';
    const emailExist = await DBquery(querystr, [email, userId]);

    if (emailExist.length > 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Email Already Exists',
      };
      hasAlert = true;
    }

    if (hasAlert) {
      return res.redirect('/admin/add-users');
    }

    let location = country;

    if (!country) {
      querystr = 'SELECT location FROM users WHERE id = ?';

      const oldLocation = await DBquery(querystr, [userId]);
      location = oldLocation[0].location;
    }

    queryvalue = [username, email, role, name, location];
    querystr =
      'UPDATE users SET username = ?, email = ?, role = ?, name = ?, location = ? WHERE id = ?';

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      queryvalue.push(hashedPassword);

      querystr =
        'UPDATE users SET username = ?, email = ?, role = ?, name = ?, location = ?, password = ? WHERE id = ?';
    }

    queryvalue.push(userId);
    await DBquery(querystr, queryvalue);

    await commitTransaction(connection);

    req.session.alert = {
      type: 'alert-success',
      message: 'User Updated Succesfully',
    };

    return res.redirect('/admin/users');
  } catch (error) {
    if (connection) {
      await rollbackTransaction(connection);
    }
    next(error);
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};

const deleteUsers = async (req, res, next) => {
  try {
    const userId = req.params.id;

    querystr = 'DELETE FROM users WHERE id = ?';
    queryvalue = [userId];
    await DBquery(querystr, queryvalue);

    req.session.alert = {
      type: 'alert-success',
      message: 'User Updated Succesfully',
    };

    return res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPage,
  addUsers,
  getAddUsersPage,
  getEditUsersPage,
  editUsers,
  deleteUsers,
};
