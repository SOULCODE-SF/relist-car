const db = require('../../db');
const query = require('../store/query');
const bcrypt = require('bcrypt');

exports.addUser = async (req, res) => {
  let connection;
  try {
    const { username, email, password, rePassword, name, location } = req.body;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const usernameExist = await connection.query(query.users.cekUsername, [
      username,
    ]);

    if (usernameExist[0].length > 0) {
      return res.json({
        messsage: 'Username Already Exist',
      });
    }

    const emailExist = await connection.query(query.users.cekEmail, [email]);

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

    await connection.query(query.users.addUser, [
      username,
      email,
      hashedPassword,
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
    console.error(error.messsage);
    res.json(error.messsage);
  }
};
