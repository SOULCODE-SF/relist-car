const { DBquery } = require('./database');

var querystr = '',
  queryvalue = [];

const getBrandNameById = async (id) => {
  querystr = 'SELECT name FROM brands WHERE id = ?';
  queryvalue = [id];

  const data = await DBquery(querystr, queryvalue);

  return data[0].name;
};

const getModelNameById = async (id) => {
  querystr = 'SELECT name FROM models WHERE id = ?';
  queryvalue = [id];

  const data = await DBquery(querystr, queryvalue);

  return data[0].name;
};

const getGenerationNameById = async (id) => {
  querystr = 'SELECT title FROM generations WHERE id = ?';
  queryvalue = [id];

  const data = await DBquery(querystr, queryvalue);

  return data[0].title;
};

function formateEngine(input) {
  let formatted = input.replace(/[\(\)]/g, '');

  formatted = formatted.replace(/%20/g, '-');

  formatted = formatted.toLowerCase();

  return formatted;
}

function revertParam(input) {
  let reverted = input.replace(/-/g, ' ');

  return reverted;
}

module.exports = {
  getBrandNameById,
  getModelNameById,
  getGenerationNameById,
  formateEngine,
  revertParam,
};
