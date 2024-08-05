const db = require('../../db');
const bcrypt = require('bcrypt');
const queryStore = require('../store/query');

exports.addUser = async (req, res) => {
  let connection;
  try {
    const { username, email, password, role, rePassword, name, location } =
      req.body;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const usernameExist = await connection.query(queryStore.users.cekUsername, [
      username,
    ]);

    if (usernameExist[0].length > 0) {
      return res.json({
        messsage: 'Username Already Exist',
      });
    }

    const emailExist = await connection.query(queryStore.users.cekEmail, [
      email,
    ]);

    if (emailExist[0].length > 0) {
      return res.json({
        messsage: 'Email Already Exist',
      });
    }

    if (password != rePassword) {
      return res.json({
        messsage: 'Password not match',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.query(queryStore.users.addUser, [
      username,
      email,
      hashedPassword,
      role,
      name,
      location,
    ]);

    await connection.commit();

    return res.json({
      messsage: 'Success',
      data: req.body,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error(error);
    res.json(error.messsage);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { inputUsr, password } = req.body;

    const [user] = await db.query(queryStore.users.getLoginData, [
      inputUsr,
      inputUsr,
    ]);

    if (user.length == 0) {
      return res.render('auth/login', {
        title: 'Login',
        currentPage: 'login',
        errorMessage: 'User not found',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);

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
      res.render('auth/login', {
        errorMessage: 'Invalid Credentials',
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
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
