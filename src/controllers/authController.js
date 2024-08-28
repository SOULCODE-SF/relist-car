const bcrypt = require('bcrypt');
const queryStore = require('../store/query');
const {
  DBquery,
  getConnection,
  rollbackTransaction,
  commitTransaction,
} = require('../utils/database');

exports.addUser = async (req, res, next) => {
  let connection;
  try {
    const { username, email, password, role, rePassword, name, location } =
      req.body;

    connection = await getConnection();
    await connection.beginTransaction();

    // Check if username exists
    const usernameExist = await DBquery(queryStore.users.cekUsername, [
      username,
    ]);
    if (usernameExist.length > 0) {
      await rollbackTransaction(connection);
      return res.status(400).json({
        message: 'Username Already Exists',
      });
    }

    // Check if email exists
    const emailExist = await db.DBquery(queryStore.users.cekEmail, [email]);
    if (emailExist.length > 0) {
      await rollbackTransaction(connection);
      return res.status(400).json({
        message: 'Email Already Exists',
      });
    }

    // Check if passwords match
    if (password !== rePassword) {
      await rollbackTransaction(connection);
      return res.status(400).json({
        message: 'Passwords do not match',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user to the database
    await DBquery(queryStore.users.addUser, [
      username,
      email,
      hashedPassword,
      role,
      name,
      location,
    ]);

    await commitTransaction(connection);

    return res.status(201).json({
      message: 'User created successfully',
      data: req.body,
    });
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

    console.log('password match', passwordMatch)

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

exports.logoutUser = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).send('Logout failed');
      }

      res.redirect('/login');
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).send('Internal Server Error');
  }
};
