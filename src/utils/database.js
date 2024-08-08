const db = require('../config/db'); // Adjust the path to your DB configuration file

// Function to get a database connection
const getConnection = async () => {
  try {
    return await db.getConnection();
  } catch (error) {
    console.error('Error getting connection:', error.message);
    throw new Error('Failed to get a database connection');
  }
};

// Function to commit a transaction
const commitTransaction = async (connection) => {
  try {
    await connection.commit();
  } catch (error) {
    console.error('Error committing transaction:', error.message);
    throw new Error('Failed to commit the transaction');
  }
};

// Function to rollback a transaction
const rollbackTransaction = async (connection) => {
  try {
    await connection.rollback();
  } catch (error) {
    console.error('Error rolling back transaction:', error.message);
    throw new Error('Failed to rollback the transaction');
  }
};

// Function to release a connection
const releaseConnection = (connection) => {
  connection.release();
};

const DBquery = async (queryStr, params) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.query(queryStr, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw new Error(`Database query failed: ${error.message}`);
  } finally {
    if (connection) {
      releaseConnection(connection);
    }
  }
};

module.exports = {
  getConnection,
  commitTransaction,
  rollbackTransaction,
  releaseConnection,
  DBquery,
};
