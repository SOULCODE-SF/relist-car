const bcrypt = require('bcrypt');
const queryStore = require('../store/query');
const {
  DBquery,
  getConnection,
  rollbackTransaction,
  commitTransaction,
  releaseConnection,
} = require('../utils/database');

exports.addUser = async (req, res, next) => {
  let connection;
  try {
    const {
      username,
      email,
      password,
      role = 'user',
      rePassword,
      name,
      country,
    } = req.body;

    console.log(req.body);

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

    if (password !== rePassword) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Password do not match',
      };
      hasAlert = true;
    }

    if (hasAlert) {
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await DBquery(queryStore.users.addUser, [
      username,
      email,
      hashedPassword,
      role,
      name,
      country,
    ]);

    await commitTransaction(connection);

    req.session.alert = {
      type: 'alert-success',
      message: 'Register Success',
    };

    return res.redirect('/login');
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

exports.loginUser = async (req, res, next) => {
  try {
    const { inputUsr, password } = req.body;

    const user = await DBquery(queryStore.users.getLoginData, [
      inputUsr,
      inputUsr,
    ]);

    if (user.length == 0) {
      req.session.alert = {
        type: 'alert-danger',
        message: 'User nout found',
      };
      res.redirect('/login');
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);

    console.log('password match', passwordMatch);

    if (passwordMatch) {
      req.session.userId = user[0].id;
      req.session.username = user[0].username;
      req.session.email = user[0].email;
      req.session.role = user[0].role;
      req.session.name = user[0].name;
      req.session.location = user[0].location;

      if (user[0].role == 'admin') {
        res.redirect('/admin');
      } else {
        res.redirect('/');
      }
    } else {
      req.session.alert = {
        type: 'alert-danger',
        message: 'Invalid Credential',
      };
      res.redirect('/login');
    }
  } catch (error) {
    next(error);
  }
};

exports.logoutUser = (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        next(err);
      }

      res.redirect('/login');
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};
